import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Alert, Paper, Tabs, Tab } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { mealService } from '../services/api';
import MealList from '../components/MealList';
import MealForm from '../components/MealForm';

const Meals = () => {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { action } = useParams();

  useEffect(() => {
    if (action === 'add') {
      setActiveTab(1);
    } else {
      setActiveTab(0);
      fetchMeals();
    }
  }, [action]);

  const fetchMeals = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await mealService.getMeals();
      setMeals(response.data);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      navigate('/meals');
    } else {
      navigate('/meals/add');
    }
  };

  const handleMealAdded = () => {
    fetchMeals();
    setActiveTab(0);
    navigate('/meals');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meal Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Log and manage your meals to track nutrition
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 1 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="View Meals" />
          <Tab label="Add Meal" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 ? (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            ) : (
              <MealList meals={meals} onMealUpdated={fetchMeals} />
            )}
          </>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Add New Meal
            </Typography>
            <MealForm onMealAdded={handleMealAdded} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Meals; 