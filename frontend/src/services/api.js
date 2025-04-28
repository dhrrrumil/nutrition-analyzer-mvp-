import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

// Add authorization header to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: (username, password) => {
    return api.post('/login', { username, password });
  },
  register: (username, password) => {
    return api.post('/register', { username, password });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
};

// Meal services
export const mealService = {
  getMeals: () => {
    return api.get('/meals');
  },
  addMeal: (mealData) => {
    return api.post('/meals', mealData);
  },
  updateMeal: (id, mealData) => {
    return api.put(`/meals/${id}`, mealData);
  },
  deleteMeal: (id) => {
    return api.delete(`/meals/${id}`);
  },
  analyzeNutrition: (query) => {
    return api.post('/nutrition', { query });
  }
};

// Progress services
export const progressService = {
  getProgress: () => {
    return api.get('/progress');
  },
  getRecommendations: () => {
    return api.get('/recommendations');
  }
};

// Admin services
export const adminService = {
  getStats: () => {
    return api.get('/admin/stats');
  },
  getUsers: () => {
    return api.get('/admin/users');
  },
  deleteUser: (userId) => {
    return api.delete(`/admin/users/${userId}`);
  },
  getUserMeals: (userId) => {
    return api.get(`/admin/users/${userId}/meals`);
  }
};

// Food Recognition services
export const foodRecognitionService = {
  recognizeFood: (imageData) => {
    return api.post('/recognize-food', { image: imageData });
  },
  getNutritionByName: (foodName, quantity = '1') => {
    return api.post('/nutrition-by-name', { food_name: foodName, quantity });
  }
};

export default api; 