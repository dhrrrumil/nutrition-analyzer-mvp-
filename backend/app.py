from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import os
import requests
from bson import ObjectId
from datetime import datetime, timedelta

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv is not installed, continue without it
    pass

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, support_credentials=True)

# Config
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')  # Change this in production
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/nutrition_db')
NUTRITIONIX_APP_ID = os.environ.get('NUTRITIONIX_APP_ID', 'demo_app_id')
NUTRITIONIX_API_KEY = os.environ.get('NUTRITIONIX_API_KEY', 'demo_api_key')

# MongoDB setup
client = MongoClient(MONGO_URI)
db = client.get_database()
users_col = db.users
meals_col = db.meals

# JWT setup
jwt = JWTManager(app)

@app.route('/')
def health_check():
    return {'status': 'ok'}, 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return {'msg': 'Username and password required'}, 400
    if users_col.find_one({'username': username}):
        return {'msg': 'Username already exists'}, 409
    hashed_pw = generate_password_hash(password)
    users_col.insert_one({'username': username, 'password': hashed_pw})
    return {'msg': 'User registered successfully'}, 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = users_col.find_one({'username': username})
    if not user or not check_password_hash(user['password'], password):
        return {'msg': 'Invalid credentials'}, 401
    access_token = create_access_token(identity=str(user['_id']))
    return {'access_token': access_token, 'username': username}, 200

# --- Meal Logging CRUD ---
@app.route('/meals', methods=['POST'])
@jwt_required()
def add_meal():
    user_id = get_jwt_identity()
    data = request.get_json()
    meal = {
        'user_id': user_id,
        'name': data.get('name'),
        'items': data.get('items', []),  # list of food items
        'meal_type': data.get('meal_type', 'other'),
        'date': data.get('date', datetime.utcnow().isoformat()),
        'created_at': datetime.utcnow()
    }
    result = meals_col.insert_one(meal)
    meal['_id'] = str(result.inserted_id)
    return meal, 201

@app.route('/meals', methods=['GET'])
@jwt_required()
def get_meals():
    user_id = get_jwt_identity()
    meals = list(meals_col.find({'user_id': user_id}))
    for m in meals:
        m['_id'] = str(m['_id'])
    return jsonify(meals)

@app.route('/meals/<meal_id>', methods=['PUT'])
@jwt_required()
def update_meal(meal_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    update = {k: v for k, v in data.items() if k in ['name', 'items', 'meal_type', 'date']}
    result = meals_col.update_one({'_id': ObjectId(meal_id), 'user_id': user_id}, {'$set': update})
    if result.matched_count == 0:
        return {'msg': 'Meal not found'}, 404
    return {'msg': 'Meal updated'}, 200

@app.route('/meals/<meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(meal_id):
    user_id = get_jwt_identity()
    result = meals_col.delete_one({'_id': ObjectId(meal_id), 'user_id': user_id})
    if result.deleted_count == 0:
        return {'msg': 'Meal not found'}, 404
    return {'msg': 'Meal deleted'}, 200

# --- Nutrition Analysis ---
@app.route('/nutrition', methods=['POST'])
@jwt_required()
def analyze_nutrition():
    data = request.get_json()
    query = data.get('query')
    if not query:
        return {'msg': 'Query required'}, 400
    url = 'https://trackapi.nutritionix.com/v2/natural/nutrients'
    headers = {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=headers, json={'query': query})
    if response.status_code != 200:
        return {'msg': 'Nutritionix API error'}, 500
    return response.json(), 200

# --- Progress Tracking ---
@app.route('/progress', methods=['GET'])
@jwt_required()
def get_progress():
    user_id = get_jwt_identity()
    # Get meals for the last 7 days
    since = datetime.utcnow() - timedelta(days=7)
    meals = list(meals_col.find({'user_id': user_id, 'created_at': {'$gte': since}}))
    # Aggregate calories and macros
    total_calories = 0
    macros = {'carbs': 0, 'protein': 0, 'fat': 0}
    for meal in meals:
        for item in meal.get('items', []):
            total_calories += item.get('calories', 0)
            macros['carbs'] += item.get('carbs', 0)
            macros['protein'] += item.get('protein', 0)
            macros['fat'] += item.get('fat', 0)
    return {'total_calories': total_calories, 'macros': macros, 'meals_logged': len(meals)}, 200

# --- Recommendations (basic) ---
@app.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    # Example: If user logs <2 meals/day, recommend more frequent logging
    today = datetime.utcnow().date()
    meals_today = meals_col.count_documents({'user_id': user_id, 'date': {'$regex': str(today)}})
    recs = []
    if meals_today < 2:
        recs.append('Try to log all your meals for better tracking!')
    # Example: If protein < 50g in last 7 days, recommend more protein
    since = datetime.utcnow() - timedelta(days=7)
    meals = list(meals_col.find({'user_id': user_id, 'created_at': {'$gte': since}}))
    total_protein = sum(item.get('protein', 0) for meal in meals for item in meal.get('items', []))
    if total_protein < 350:  # 50g/day * 7
        recs.append('Increase your protein intake for better muscle health!')
    if not recs:
        recs.append('Great job! Keep up your healthy eating habits!')
    return {'recommendations': recs}, 200

if __name__ == '__main__':
    app.run(debug=True)
