# test_api.py
import requests

base_url = "http://localhost:5000"

# Test root endpoint
print("Testing root endpoint...")
response = requests.get(f"{base_url}/")
print(response.json())

# Test users endpoint
print("\nTesting users endpoint...")
response = requests.get(f"{base_url}/api/users")
print(response.json())

# Test login
print("\nTesting login...")
login_data = {
    "email": "test@example.com",
    "password": "123456"
}
response = requests.post(f"{base_url}/api/login", json=login_data)
print(response.json())