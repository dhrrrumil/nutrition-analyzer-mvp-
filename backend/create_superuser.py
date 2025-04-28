from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import os

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv is not installed, continue without it
    pass

# Get MongoDB URI from environment or use default
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/nutrition_db')

# MongoDB setup
client = MongoClient(MONGO_URI)
db = client.get_database()
users_col = db.users

# Superuser details
username = "admin"
password = "admin123"  # You can change this to a more secure password

# Check if the user already exists
if users_col.find_one({"username": username}):
    print(f"User '{username}' already exists!")
else:
    # Create the superuser
    hashed_pw = generate_password_hash(password)
    users_col.insert_one({
        'username': username,
        'password': hashed_pw,
        'is_admin': True  # This field can be used to identify admin users
    })
    print(f"Superuser '{username}' created successfully!")
    print(f"Password: {password}")

print("You can now log in with these credentials.") 