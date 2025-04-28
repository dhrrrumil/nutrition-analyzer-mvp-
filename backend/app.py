from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import os
import requests
from bson import ObjectId
from datetime import datetime, timedelta
import base64
import io
from PIL import Image
import json

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv is not installed, continue without it
    pass

app = Flask(__name__)
# Updated CORS configuration
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return response

# Config
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')  # Change this in production
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/nutrition_db')
NUTRITIONIX_APP_ID = os.environ.get('NUTRITIONIX_APP_ID', 'demo_app_id')
NUTRITIONIX_API_KEY = os.environ.get('NUTRITIONIX_API_KEY', 'demo_api_key')
USDA_API_KEY = os.environ.get('USDA_API_KEY', 'RYTQjMiUg92TJwbLw1nRaxFJTp07gwYX8HvMgWNr')
print('USDA_API_KEY:', USDA_API_KEY)

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
    
    # Include is_admin in the response if it exists
    is_admin = user.get('is_admin', False)
    
    access_token = create_access_token(identity=str(user['_id']))
    return {
        'access_token': access_token, 
        'username': username,
        'is_admin': is_admin
    }, 200

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
    # Use USDA FoodData Central API
    url = 'https://api.nal.usda.gov/fdc/v1/foods/search'
    params = {
        'api_key': USDA_API_KEY,
        'query': query,
        'pageSize': 1
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return {'msg': 'USDA API error'}, 500
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

# Check if user is admin
def is_admin(user_id):
    user = users_col.find_one({'_id': ObjectId(user_id)})
    return user and user.get('is_admin', False)

# --- Admin Routes ---
@app.route('/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return {'msg': 'Admin access required'}, 403
        
    # Get statistics
    user_count = users_col.count_documents({})
    meal_count = meals_col.count_documents({})
    
    # Count active users (users who logged meals in the last 7 days)
    since = datetime.utcnow() - timedelta(days=7)
    active_user_ids = set(meal['user_id'] for meal in meals_col.find({'created_at': {'$gte': since}}))
    active_users = len(active_user_ids)
    
    return {
        'user_count': user_count,
        'meal_count': meal_count,
        'active_users': active_users
    }, 200

@app.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return {'msg': 'Admin access required'}, 403
        
    users = list(users_col.find({}, {'password': 0}))  # Exclude passwords
    for user in users:
        user['_id'] = str(user['_id'])
    
    return jsonify(users)

@app.route('/admin/users/<user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return {'msg': 'Admin access required'}, 403
    
    # Don't allow admins to delete themselves
    if user_id == admin_id:
        return {'msg': 'Cannot delete your own admin account'}, 400
        
    # Delete user
    result = users_col.delete_one({'_id': ObjectId(user_id)})
    if result.deleted_count == 0:
        return {'msg': 'User not found'}, 404
        
    # Delete all meals associated with the user
    meals_col.delete_many({'user_id': user_id})
    
    return {'msg': 'User and all associated data deleted'}, 200

@app.route('/admin/users/<user_id>/meals', methods=['GET'])
@jwt_required()
def admin_get_user_meals(user_id):
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return {'msg': 'Admin access required'}, 403
        
    meals = list(meals_col.find({'user_id': user_id}))
    for meal in meals:
        meal['_id'] = str(meal['_id'])
    
    return jsonify(meals)

# --- Food Image Recognition ---
@app.route('/recognize-food', methods=['POST'])
@jwt_required()
def recognize_food():
    data = request.get_json()
    image_data = data.get('image')
    
    if not image_data:
        return {'msg': 'Image data required'}, 400
        
    try:
        # Remove the data:image/jpeg;base64, prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
            
        # We'll use the Clarifai API for food recognition
        CLARIFAI_API_KEY = os.environ.get('CLARIFAI_API_KEY', 'YOUR_CLARIFAI_API_KEY')
        CLARIFAI_URL = "https://api.clarifai.com/v2/models/food-item-recognition/outputs"
        
        # Prepare the request to Clarifai
        headers = {
            'Authorization': f'Key {CLARIFAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        clarifai_data = {
            "inputs": [
                {
                    "data": {
                        "image": {
                            "base64": image_data
                        }
                    }
                }
            ]
        }
        
        # Call the Clarifai API
        response = requests.post(CLARIFAI_URL, headers=headers, json=clarifai_data)
        
        if response.status_code != 200:
            return {'msg': 'Food recognition API error'}, 500
            
        # Process the response to get the top food predictions
        predictions = response.json()
        concepts = predictions['outputs'][0]['data']['concepts']
        
        # Get the top 3 food predictions
        top_foods = []
        for concept in concepts[:3]:
            food_name = concept['name']
            confidence = concept['value']
            
            # Only include predictions with at least 50% confidence
            if confidence > 0.5:
                top_foods.append({
                    'name': food_name,
                    'confidence': round(confidence * 100, 1)  # Convert to percentage
                })
        
        # If we don't have any confident predictions, return an error
        if not top_foods:
            return {'msg': 'Could not confidently identify any food in the image'}, 400
            
        # Return the top food predictions
        return {'foods': top_foods}, 200
        
    except Exception as e:
        print(f"Error in food recognition: {str(e)}")
        return {'msg': 'Error processing the image'}, 500

# --- Get Nutrition for Recognized Food ---
@app.route('/nutrition-by-name', methods=['POST'])
@jwt_required()
def get_nutrition_by_name():
    data = request.get_json()
    food_name = data.get('food_name')
    quantity = data.get('quantity', '1')
    
    if not food_name:
        return {'msg': 'Food name required'}, 400
        
    try:
        # Use the food name to search in the USDA database
        query = f"{quantity} {food_name}"
        
        # Use the existing nutrition endpoint logic
        url = 'https://api.nal.usda.gov/fdc/v1/foods/search'
        params = {
            'api_key': USDA_API_KEY,
            'query': query,
            'pageSize': 1
        }
        
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            return {'msg': 'USDA API error'}, 500
            
        # Return the nutrition data
        return response.json(), 200
        
    except Exception as e:
        print(f"Error getting nutrition data: {str(e)}")
        return {'msg': 'Error processing the nutrition request'}, 500

if __name__ == '__main__':
    app.run(debug=True)
