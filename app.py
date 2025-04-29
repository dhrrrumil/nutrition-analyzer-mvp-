# Load environment variables first, before any other imports
import os
from dotenv import load_dotenv
# Explicitly load from the current directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
print(f"CLARIFAI_API_KEY: {os.environ.get('CLARIFAI_API_KEY', 'Not found')[:5]}... (masked)")
print(f"USDA_API_KEY: {os.environ.get('USDA_API_KEY', 'Not found')}")

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import requests
from bson import ObjectId
from datetime import datetime, timedelta
import base64
import io

# Try different ways to import PIL
try:
    from PIL import Image
except ImportError:
    try:
        import PIL
        import PIL.Image
        Image = PIL.Image
    except ImportError:
        print("ERROR: PIL/Pillow is not installed correctly. Please run 'pip install pillow' in your virtual environment.")
import json

# Import our food recognition module
try:
    from food_recognition import recognize_food_from_image
    print("Successfully imported food_recognition module")
except ImportError:
    print("WARNING: food_recognition module not found. Will fall back to direct API calls.")
    recognize_food_from_image = None

app = Flask(__name__)

# Fix CORS configuration - use only one method of setting CORS headers
# Use the flask-cors extension with proper configuration
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     expose_headers=["Content-Type", "X-CSRFToken"],
     allow_headers=["Content-Type", "Authorization", "Accept"])

# Config
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')  # Change this in production
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/nutrition_db')
NUTRITIONIX_APP_ID = os.environ.get('NUTRITIONIX_APP_ID', 'demo_app_id')
NUTRITIONIX_API_KEY = os.environ.get('NUTRITIONIX_API_KEY', 'demo_api_key')
USDA_API_KEY = os.environ.get('USDA_API_KEY', 'RYTQjMiUg92TJwbLw1nRaxFJTp07gwYX8HvMgWNr')
print('USDA_API_KEY:', USDA_API_KEY)

# Add this route to handle preflight requests for all routes
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

@app.route('/recognize-food', methods=['POST', 'OPTIONS'])
# Temporarily remove JWT requirement for testing
# @jwt_required()
def recognize_food():
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        return response
        
    data = request.get_json()
    image_data = data.get('image')
    
    if not image_data:
        return {'msg': 'Image data required'}, 400

    try:
        # Try to use our dedicated food recognition module if available
        if recognize_food_from_image:
            print("Using food_recognition module for recognition")
            recognized_foods = recognize_food_from_image(image_base64=image_data)
            
            if recognized_foods is None:
                return {
                    'msg': 'Food recognition failed',
                    'details': 'API key missing or error in recognition'
                }, 500
                
            # Return the top food predictions
            print(f"Returning food predictions: {recognized_foods}")
            return {'foods': recognized_foods}, 200
        else:
            # Fallback to original implementation
            # Get the Clarifai API key directly from environment
            CLARIFAI_API_KEY = os.environ.get('CLARIFAI_API_KEY')
            print(f"Using Clarifai API key: {CLARIFAI_API_KEY[:5]}...{CLARIFAI_API_KEY[-4:]} (masked for security)")
            
            # Check if the API key is set or still has the placeholder value
            if not CLARIFAI_API_KEY:
                return {
                    'msg': 'Clarifai API key not configured properly. Please check your .env file.',
                    'details': 'API key is missing or invalid.'
                }, 500
                
            # Remove the data:image/jpeg;base64, prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
                
            # Use the general food model which is more reliable
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
            
            print("Sending request to Clarifai API...")
            
            # Call the Clarifai API
            response = requests.post(CLARIFAI_URL, headers=headers, json=clarifai_data, timeout=30)
            
            # Print response details for debugging
            print(f"Clarifai response status: {response.status_code}")
            
            # If Clarifai returns an error, log it and return a detailed error message
            if response.status_code != 200:
                try:
                    error_details = response.json() if response.content else 'No error details available'
                except:
                    error_details = 'Failed to parse error response'
                    
                print(f"Clarifai API error: {response.status_code} - {error_details}")
                return {
                    'msg': 'Food recognition API error',
                    'status_code': response.status_code,
                    'details': str(error_details)
                }, 500
                
            # Process the response to get the top food predictions
            try:
                predictions = response.json()
                print("Clarifai API response received successfully")
            except Exception as e:
                print(f"Error parsing JSON response: {str(e)}")
                return {'msg': 'Invalid response format from food recognition API'}, 500
            
            # Check if the response contains concept predictions
            if 'outputs' not in predictions or not predictions['outputs'] or 'data' not in predictions['outputs'][0]:
                print(f"Invalid response format: {predictions}")
                return {'msg': 'Invalid response from food recognition API'}, 500
                
            concepts = predictions['outputs'][0]['data'].get('concepts', [])
            
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
            print(f"Returning food predictions: {top_foods}")
            return {'foods': top_foods}, 200
            
    except requests.exceptions.Timeout:
        print("Clarifai API request timed out")
        return {'msg': 'Food recognition API request timed out'}, 504
    except requests.exceptions.RequestException as e:
        print(f"Request error in food recognition: {str(e)}")
        return {'msg': f'Error connecting to food recognition API: {str(e)}'}, 500
    except Exception as e:
        print(f"Error in food recognition: {str(e)}")
        return {'msg': f'Error processing the image: {str(e)}'}, 500

# Add a simple test endpoint
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'status': 'ok', 'message': 'API is working'}), 200 

# Nutrition by name endpoint
@app.route('/nutrition-by-name', methods=['POST', 'OPTIONS'])
def get_nutrition_by_name():
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        return response
    
    data = request.get_json()
    food_name = data.get('food_name')
    quantity = data.get('quantity', '1')
    
    if not food_name:
        return {'msg': 'Food name required'}, 400
        
    try:
        # Use Nutritionix API
        url = 'https://trackapi.nutritionix.com/v2/natural/nutrients'
        headers = {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY,
            'Content-Type': 'application/json'
        }
        
        # Format query with quantity and food name
        query = f"{quantity} {food_name}"
        payload = {
            'query': query
        }
        
        print(f"Querying Nutritionix for: {query}")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        # Print response details for debugging
        print(f"Nutritionix API response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Nutritionix API error: {response.status_code} - {response.text}")
            return jsonify({
                'msg': 'Failed to retrieve nutrition information', 
                'details': 'The nutrition API returned an error'
            }), 500
            
        # Return the nutrition data
        return response.json(), 200
        
    except requests.exceptions.Timeout:
        print("Nutritionix API request timed out")
        return {'msg': 'Nutrition API request timed out'}, 504
    except requests.exceptions.RequestException as e:
        print(f"Request error in nutrition lookup: {str(e)}")
        return {'msg': f'Error connecting to nutrition API: {str(e)}'}, 500
    except Exception as e:
        print(f"Error getting nutrition data: {str(e)}")
        return {'msg': 'Error processing the nutrition request'}, 500

if __name__ == "__main__":
    app.run(debug=True) 