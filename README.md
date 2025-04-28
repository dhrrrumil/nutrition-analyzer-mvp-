# Nutrition Analyzer MVP

A full-stack web application for tracking and analyzing nutritional information. The app allows users to log meals, analyze nutritional content, and track progress over time.

## Features

- User authentication (register, login, logout)
- Meal logging with nutritional analysis
- Progress tracking with visual representations
- Personalized nutritional recommendations

## Tech Stack

- **Frontend**: React, Material-UI, Axios
- **Backend**: Flask, PyMongo, JWT Authentication
- **Database**: MongoDB
- **External API**: Nutritionix API for nutrition data

## Project Structure

```
nutrition-analyzer-mvp/
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions and context
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
└── backend/                # Flask backend
    ├── app.py              # Main application file
    ├── test_app.py         # Tests
    └── requirements.txt    # Backend dependencies
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.7+)
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/nutrition_db
   JWT_SECRET_KEY=your-secret-key-change-in-production
   NUTRITIONIX_APP_ID=your_app_id
   NUTRITIONIX_API_KEY=your_api_key
   ```

5. Run the server:
   ```
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```
   npm start
   ```

## Running Tests

### Backend Tests

```
cd backend
python -m pytest
```

### Frontend Tests

```
cd frontend
npm test
```

## API Endpoints

- **GET /**: Health check
- **POST /register**: User registration
- **POST /login**: User login
- **GET /meals**: Get all meals
- **POST /meals**: Add a new meal
- **PUT /meals/:id**: Update a meal
- **DELETE /meals/:id**: Delete a meal
- **POST /nutrition**: Analyze nutrition for food items
- **GET /progress**: Get user's nutritional progress
- **GET /recommendations**: Get personalized recommendations

## License

MIT 