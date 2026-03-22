import pytest
import json
import uuid
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
    data = response.get_json()
    assert data["status"] == "ok"
    assert data.get("version")

def test_register_user(client):
    # Test user registration (unique username avoids conflict with prior DB state)
    test_user = {
        'username': f'testuser_{uuid.uuid4().hex[:10]}',
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


def test_profile_requires_auth(client):
    response = client.get('/profile')
    assert response.status_code == 401


def test_profile_returns_basic_info(client):
    test_user = {
        'username': 'profileuser',
        'password': 'password123',
    }
    client.post('/register', data=json.dumps(test_user), content_type='application/json')
    login_res = client.post('/login', data=json.dumps(test_user), content_type='application/json')
    token = login_res.get_json()['access_token']
    response = client.get('/profile', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['username'] == 'profileuser'
    assert 'meals_logged' in data
    assert data['meals_logged'] == 0
    assert 'is_admin' in data
    assert 'created_at' in data