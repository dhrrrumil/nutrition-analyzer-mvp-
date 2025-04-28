import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/')
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}

def test_register_user(client):
    # Test user registration
    test_user = {
        'username': 'testuser',
        'password': 'password123'
    }
    response = client.post('/register', 
                         data=json.dumps(test_user),
                         content_type='application/json')
    assert response.status_code == 201
    assert 'User registered successfully' in response.get_json()['msg']

def test_login_user(client):
    # Register first
    test_user = {
        'username': 'logintest',
        'password': 'password123'
    }
    client.post('/register', 
               data=json.dumps(test_user),
               content_type='application/json')
    
    # Then test login
    response = client.post('/login', 
                         data=json.dumps(test_user),
                         content_type='application/json')
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data
    assert data['username'] == 'logintest'