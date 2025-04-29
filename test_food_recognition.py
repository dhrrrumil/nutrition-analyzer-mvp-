import os
import requests
import argparse
import base64
import json
from datetime import datetime

def test_food_recognition_endpoint(image_path, server_url="http://127.0.0.1:5000"):
    """
    Test the food recognition endpoint by sending an image to the server.
    
    Args:
        image_path (str): Path to the image file
        server_url (str): URL of the server running the food recognition API
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file '{image_path}' does not exist.")
        return
    
    # Load and encode the image
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Error reading or encoding image: {str(e)}")
        return
    
    # Prepare the request
    url = f"{server_url}/recognize-food"
    headers = {
        'Content-Type': 'application/json'
    }
    payload = {
        'image': f"data:image/jpeg;base64,{encoded_string}"
    }
    
    print(f"Sending request to {url}")
    print(f"Image size: {len(encoded_string) // 1024} KB")
    
    # Send the request
    try:
        start_time = datetime.now()
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        end_time = datetime.now()
        time_taken = (end_time - start_time).total_seconds()
        
        print(f"Request completed in {time_taken:.2f} seconds")
        print(f"Response status code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print("\nRecognized Foods:")
                print("----------------")
                if 'foods' in result and result['foods']:
                    for idx, food in enumerate(result['foods'], 1):
                        print(f"{idx}. {food['name']} ({food['confidence']}% confidence)")
                        
                    # Test nutrition endpoint for the first recognized food
                    print("\nTesting nutrition endpoint with the first recognized food...")
                    test_nutrition_endpoint(result['foods'][0]['name'], server_url)
                else:
                    print("No foods were recognized.")
            except Exception as e:
                print(f"Error parsing response: {str(e)}")
                print(f"Response text: {response.text[:500]}")
        else:
            try:
                error_data = response.json()
                print(f"Error response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response (not JSON): {response.text[:500]}")
    
    except requests.exceptions.Timeout:
        print("Request timed out. Server may be slow or not responding.")
    except requests.exceptions.ConnectionError:
        print(f"Connection error. Make sure the server is running at {server_url}")
    except Exception as e:
        print(f"Error during request: {str(e)}")

def test_nutrition_endpoint(food_name, server_url="http://127.0.0.1:5000", quantity="1"):
    """
    Test the nutrition-by-name endpoint with a recognized food name.
    
    Args:
        food_name (str): Name of the food to get nutrition for
        server_url (str): URL of the server running the API
        quantity (str): Quantity of the food (default: "1")
    """
    url = f"{server_url}/nutrition-by-name"
    headers = {
        'Content-Type': 'application/json'
    }
    payload = {
        'food_name': food_name,
        'quantity': quantity
    }
    
    try:
        print(f"Getting nutrition info for: {quantity} {food_name}")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Response status code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                if 'foods' in result and result['foods']:
                    food = result['foods'][0]
                    print("\nNutrition Information:")
                    print("----------------------")
                    print(f"Food: {food.get('food_name', food_name)}")
                    print(f"Serving: {food.get('serving_qty', quantity)} {food.get('serving_unit', 'serving')}")
                    print(f"Calories: {food.get('nf_calories', 'N/A')} kcal")
                    print(f"Protein: {food.get('nf_protein', 'N/A')}g")
                    print(f"Carbs: {food.get('nf_total_carbohydrate', 'N/A')}g")
                    print(f"Fat: {food.get('nf_total_fat', 'N/A')}g")
                else:
                    print("No nutrition information returned.")
            except Exception as e:
                print(f"Error parsing nutrition response: {str(e)}")
        else:
            try:
                error_data = response.json()
                print(f"Nutrition endpoint error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Nutrition endpoint error (not JSON): {response.text[:500]}")
    
    except Exception as e:
        print(f"Error getting nutrition data: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test the food recognition API')
    parser.add_argument('image_path', help='Path to the food image')
    parser.add_argument('--server', default='http://127.0.0.1:5000',
                        help='Server URL (default: http://127.0.0.1:5000)')
    
    args = parser.parse_args()
    
    print("Food Recognition API Test")
    print("========================")
    print(f"Image: {args.image_path}")
    print(f"Server: {args.server}")
    print("========================\n")
    
    test_food_recognition_endpoint(args.image_path, args.server) 