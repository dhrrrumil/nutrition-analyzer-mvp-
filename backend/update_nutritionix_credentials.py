import os

# Nutritionix API credentials
APP_ID = input("Enter your Nutritionix App ID: ")
API_KEY = input("Enter your Nutritionix API Key: ")

# Create or update .env file
env_file = os.path.join(os.path.dirname(__file__), '.env')

# Read existing content if file exists
env_content = {}
if os.path.exists(env_file):
    with open(env_file, 'r') as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                env_content[key] = value

# Update or add Nutritionix credentials
env_content['NUTRITIONIX_APP_ID'] = APP_ID
env_content['NUTRITIONIX_API_KEY'] = API_KEY

# Ensure other required variables exist
if 'JWT_SECRET_KEY' not in env_content:
    env_content['JWT_SECRET_KEY'] = 'super-secret-key'
if 'MONGO_URI' not in env_content:
    env_content['MONGO_URI'] = 'mongodb://localhost:27017/nutrition_db'

# Write back to file
with open(env_file, 'w') as f:
    for key, value in env_content.items():
        f.write(f"{key}={value}\n")

print(f"\nNutritionix API credentials updated in {env_file}")
print("Restart your Flask app for the changes to take effect.")
print("\nIf you haven't signed up for a Nutritionix API account, visit:")
print("https://developer.nutritionix.com/signup") 