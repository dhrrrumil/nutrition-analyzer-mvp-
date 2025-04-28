import axios from 'axios';

// Use relative URLs instead of absolute to work with the proxy
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  register: (username, password) => 
    api.post('/register', { username, password }),
  
  login: (username, password) => 
    api.post('/login', { username, password }),
    
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
};

export const mealService = {
  getMeals: () => api.get('/meals'),
  
  addMeal: (mealData) => api.post('/meals', mealData),
  
  updateMeal: (mealId, mealData) => api.put(`/meals/${mealId}`, mealData),
  
  deleteMeal: (mealId) => api.delete(`/meals/${mealId}`),
  
  analyzeNutrition: (query) => 
    api.post('/nutrition', { query })
};

export const userService = {
  getProgress: () => api.get('/progress'),
  
  getRecommendations: () => api.get('/recommendations')
};

export default api; 