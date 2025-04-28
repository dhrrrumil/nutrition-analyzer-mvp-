import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { mealService, progressService } from '../services/api';
import MealList from '../components/MealList';
import ProgressDisplay from '../components/ProgressDisplay';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  // Move fetchDashboardData outside of useEffect
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all data in parallel
      const [mealsResponse, progressResponse, recommendationsResponse] = await Promise.all([
        mealService.getMeals(),
        progressService.getProgress(),
        progressService.getRecommendations()
      ]);
      
      setMeals(mealsResponse.data);
      setProgress(progressResponse.data);
      setRecommendations(recommendationsResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const handleAddMeal = () => {
    navigate('/meals/add');
  };

  const handleRefresh = async () => {
    await fetchDashboardData();
  };
  
  // Recent meals only shows the last 3 meals
  const recentMeals = meals.slice(0, 3);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.username || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your nutrition, achieve your goals
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : (
        <>
          <ProgressDisplay progressData={progress} recommendations={recommendations} />
          
          <Box sx={{ mt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Recent Meals
              </Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/meals')}
                  sx={{ mr: 1 }}
                >
                  View All
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleAddMeal}
                >
                  Add Meal
                </Button>
              </Box>
            </Box>
            
            {recentMeals.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You haven't logged any meals yet
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleAddMeal}
                >
                  Log Your First Meal
                </Button>
              </Paper>
            ) : (
              <MealList meals={recentMeals} onMealUpdated={handleRefresh} />
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default Dashboard;