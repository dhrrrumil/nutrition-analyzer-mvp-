import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Grid, Dialog, IconButton, Divider } from '@mui/material';
import { mealService } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MealForm from './MealForm';

const MealList = ({ meals, onMealUpdated }) => {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  const handleEditClick = (meal) => {
    setSelectedMeal(meal);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedMeal(null);
  };

  const handleMealUpdated = () => {
    handleCloseEditDialog();
    if (onMealUpdated) {
      onMealUpdated();
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await mealService.deleteMeal(mealId);
      setDeleteConfirmationId(null);
      if (onMealUpdated) {
        onMealUpdated();
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const getTotalCalories = (items) => {
    return items.reduce((sum, item) => sum + item.calories, 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'breakfast':
        return 'primary';
      case 'lunch':
        return 'success';
      case 'dinner':
        return 'secondary';
      case 'snack':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {meals.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          No meals found. Start by adding a meal!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {meals.map((meal) => (
            <Grid item xs={12} md={6} key={meal._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {meal.name}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditClick(meal)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => setDeleteConfirmationId(meal._id)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={meal.meal_type} 
                      size="small" 
                      color={getMealTypeColor(meal.meal_type)} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(meal.date)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {meal.items.length} items | {Math.round(getTotalCalories(meal.items))} calories
                  </Typography>
                  
                  {meal.items.map((item, index) => (
                    <Box key={index} sx={{ mb: 0.5 }}>
                      <Typography variant="body2">
                        {item.name} ({item.serving_size}) - {Math.round(item.calories)} cal
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
              
              {deleteConfirmationId === meal._id && (
                <Box sx={{ mt: 1, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Are you sure you want to delete this meal?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="error" 
                      onClick={() => handleDeleteMeal(meal._id)}
                    >
                      Delete
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => setDeleteConfirmationId(null)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
      )}
      
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Edit Meal
          </Typography>
          {selectedMeal && (
            <MealForm 
              initialData={selectedMeal} 
              onMealAdded={handleMealUpdated} 
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default MealList; 