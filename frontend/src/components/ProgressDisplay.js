import React from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, Divider, Card, CardContent, Alert } from '@mui/material';

const ProgressDisplay = ({ progressData, recommendations }) => {
  if (!progressData) {
    return (
      <Alert severity="info">
        Loading progress data...
      </Alert>
    );
  }

  const { total_calories, macros, meals_logged } = progressData;
  
  // Target values (could be customizable in a real app)
  const targetCalories = 2000; 
  const targetProtein = 140; // g
  const targetCarbs = 225; // g
  const targetFat = 65; // g
  
  const calculatePercentage = (value, target) => {
    return Math.min(Math.round((value / target) * 100), 100);
  };

  const caloriesPercentage = calculatePercentage(total_calories, targetCalories * 7);
  const proteinPercentage = calculatePercentage(macros.protein, targetProtein * 7);
  const carbsPercentage = calculatePercentage(macros.carbs, targetCarbs * 7);
  const fatPercentage = calculatePercentage(macros.fat, targetFat * 7);

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Past 7 Days Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {meals_logged} meals logged
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  Total Calories
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {Math.round(total_calories)} / {targetCalories * 7} cal
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={caloriesPercentage} 
                sx={{ height: 10, borderRadius: 5, my: 1 }} 
              />
              <Typography variant="body2" color="text.secondary">
                {caloriesPercentage}% of weekly goal
              </Typography>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Macronutrients
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Protein
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(macros.protein)}g
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={proteinPercentage} 
                    sx={{ height: 8, borderRadius: 5, my: 1 }}
                    color="success" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Target: {targetProtein * 7}g
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Carbs
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(macros.carbs)}g
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={carbsPercentage} 
                    sx={{ height: 8, borderRadius: 5, my: 1 }}
                    color="primary" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Target: {targetCarbs * 7}g
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Fat
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(macros.fat)}g
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={fatPercentage} 
                    sx={{ height: 8, borderRadius: 5, my: 1 }}
                    color="warning" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Target: {targetFat * 7}g
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recommendations?.recommendations?.map((rec, index) => (
                <Alert 
                  key={index} 
                  severity={rec.includes('Great job') ? 'success' : 'info'}
                  sx={{ mb: 2 }}
                >
                  {rec}
                </Alert>
              ))}
              
              {(!recommendations || recommendations.recommendations.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No recommendations available yet. Keep logging your meals!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgressDisplay; 