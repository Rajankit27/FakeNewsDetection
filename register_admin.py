import os
import datetime
from pymongo import MongoClient
from werkzeug.security import generate_password_hash

# MongoDB Setup
MONGO_URI = os.getenv('MONGO_URI', "mongodb+srv://db:db123@cluster0.t2menvi.mongodb.net/?retryWrites=true&w=majority")

try:
    client = MongoClient(MONGO_URI)
    db = client['truthlens_db']
    users_col = db['users']
    print("Connected to MongoDB Atlas successfully!")
    
    username = "admin_user"
    password = "admin_password_123"
    role = "admin"
    
    if users_col.find_one({"username": username}):
        print(f"User '{username}' already exists. Updating role to admin...")
        users_col.update_one(
            {"username": username},
            {"$set": {"role": "admin"}}
        )
        print("Updated successfully.")
    else:
        hashed = generate_password_hash(password)
        users_col.insert_one({
            "username": username,
            "password_hash": hashed,
            "role": role,
            "created_at": datetime.datetime.utcnow()
        })
        print(f"Admin user created:\nUsername: {username}\nPassword: {password}")

except Exception as e:
    print(f"Error: {e}")
