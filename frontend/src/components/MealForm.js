import React, { useState } from 'react';
import { TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Box, Typography, Alert, Tabs, Tab } from '@mui/material';
import { mealService } from '../services/api';
import FoodImageRecognition from './FoodImageRecognition';

const MealForm = ({ onMealAdded, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    meal_type: initialData?.meal_type || 'breakfast',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    query: '',
    items: initialData?.items || []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Helper function to find a nutrient by name in the USDA response
  const findNutrient = (nutrients, name) => {
    const nutrient = nutrients.find(n => 
      n.nutrientName && n.nutrientName.toLowerCase().includes(name.toLowerCase())
    );
    return nutrient ? parseFloat(nutrient.value) : 0;
  };

  const analyzeFood = async (e) => {
    e.preventDefault();
    if (!formData.query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await mealService.analyzeNutrition(formData.query);
      setAnalysisData(response.data);
      
      // Convert USDA API data to our format
      if (response.data.foods && response.data.foods.length > 0) {
        const newItems = response.data.foods.map(food => {
          // Extract nutrients from USDA format
          const nutrients = food.foodNutrients || [];
          
          // Find values for each nutrient
          const calories = findNutrient(nutrients, 'energy') || findNutrient(nutrients, 'calorie');
          const protein = findNutrient(nutrients, 'protein');
          const carbs = findNutrient(nutrients, 'carbohydrate');
          const fat = findNutrient(nutrients, 'fat');
          
          return {
            name: food.description || formData.query,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            serving_size: '100g' // Default serving size for USDA
          };
        });
        
        setFormData({
          ...formData,
          items: [...formData.items, ...newItems],
          query: ''
        });
      } else {
        setError('No foods found for your query.');
      }
    } catch (err) {
      setError('Failed to analyze nutrition data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      setError('Please add at least one food item');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (initialData && initialData._id) {
        await mealService.updateMeal(initialData._id, formData);
      } else {
        await mealService.addMeal(formData);
      }
      
      setSuccess('Meal saved successfully!');
      
      if (onMealAdded) {
        onMealAdded();
      }
      
      // Reset form if adding new meal
      if (!initialData) {
        setFormData({
          name: '',
          meal_type: 'breakfast',
          date: new Date().toISOString().split('T')[0],
          query: '',
          items: []
        });
      }
    } catch (err) {
      setError('Failed to save meal. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFoodFromImage = (foodItem) => {
    setFormData({
      ...formData,
      items: [...formData.items, foodItem]
    });
    setActiveTab(0); // Switch back to the text input tab
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Meal Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Meal Type</InputLabel>
            <Select
              name="meal_type"
              value={formData.meal_type}
              onChange={handleInputChange}
              label="Meal Type"
            >
              <MenuItem value="breakfast">Breakfast</MenuItem>
              <MenuItem value="lunch">Lunch</MenuItem>
              <MenuItem value="dinner">Dinner</MenuItem>
              <MenuItem value="snack">Snack</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, border: '1px solid #eee', p: 2, borderRadius: 1 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Text Entry" />
          <Tab label="Image Recognition" />
        </Tabs>
        
        {activeTab === 0 ? (
          <>
            <Typography variant="h6" gutterBottom>
              Add Food Items
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Describe food (e.g., '1 apple, 200g chicken breast')"
                  name="query"
                  value={formData.query}
                  onChange={handleInputChange}
                  placeholder="Enter food items to analyze"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button 
                  onClick={analyzeFood}
                  variant="contained" 
                  color="primary"
                  disabled={loading || !formData.query.trim()}
                  fullWidth
                  sx={{ height: '100%' }}
                >
                  {loading ? 'Analyzing...' : 'Analyze Food'}
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          <FoodImageRecognition onAddFood={handleAddFoodFromImage} />
        )}
        
        {formData.items.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Food Items ({formData.items.length})
            </Typography>
            
            {formData.items.map((item, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body1">
                    {item.name} ({item.serving_size})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(item.calories)} cal | P: {Math.round(item.protein)}g | C: {Math.round(item.carbs)}g | F: {Math.round(item.fat)}g
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => removeItem(index)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        fullWidth 
        sx={{ mt: 3 }}
        disabled={loading || formData.items.length === 0}
      >
        {initialData ? 'Update Meal' : 'Save Meal'}
      </Button>
    </Box>
  );
};

export default MealForm; 