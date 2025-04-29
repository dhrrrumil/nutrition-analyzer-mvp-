import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SearchIcon from '@mui/icons-material/Search';
import { foodRecognitionService, mealService } from '../services/api';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FoodImageRecognition = ({ onAddFood }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [error, setError] = useState('');
  const [recognizedFoods, setRecognizedFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [nutritionData, setNutritionData] = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset states
    setError('');
    setRecognizedFoods([]);
    setNutritionData(null);
    setSelectedFood(null);

    // Check if the file is an image
    if (!file.type.match(/image.*/)) {
      setError('Please select an image file (jpg, png)');
      return;
    }

    // Set the selected image
    setSelectedImage(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRecognizeFood = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setRecognizing(true);
    setError('');
    setRecognizedFoods([]);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        try {
          // Call the API to recognize food
          const response = await foodRecognitionService.recognizeFood(base64data);
          
          // Set the recognized foods
          setRecognizedFoods(response.data.foods);
        } catch (apiError) {
          console.error('API Error:', apiError);
          
          // Handle API configuration errors
          if (apiError.response?.data?.details && apiError.response?.data?.details.includes('API key')) {
            setError(`${apiError.response.data.msg} ${apiError.response.data.details}`);
            // Automatically switch to manual search if there's an API key issue
            setSearchMode(true);
          } else if (apiError.response?.data?.msg) {
            setError(apiError.response.data.msg);
          } else {
            setError('Error recognizing food. Please try again later.');
          }
          setRecognizing(false);
        }
      };
    } catch (error) {
      console.error('Error recognizing food:', error);
      setError(error.response?.data?.msg || 'Error recognizing food. Please try again.');
      setRecognizing(false);
    }
  };

  const handleFoodSelection = (food) => {
    setSelectedFood(food);
    setQuantity('1'); // Reset quantity when selecting a new food
    setNutritionData(null); // Reset nutrition data
  };

  const handleGetNutrition = async () => {
    if (!selectedFood) return;
    
    setLoading(true);
    try {
      const response = await foodRecognitionService.getNutritionByName(selectedFood.name, quantity);
      setNutritionData(response.data);
    } catch (error) {
      console.error('Error getting nutrition data:', error);
      setError(error.response?.data?.msg || 'Error getting nutrition data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMeal = () => {
    if (!nutritionData || !nutritionData.foods || nutritionData.foods.length === 0) return;
    
    const foodData = nutritionData.foods[0];
    
    // Find the nutrients
    const getNutrientValue = (nutrientName) => {
      if (!foodData.foodNutrients) return 0;
      
      const nutrient = foodData.foodNutrients.find(
        n => n.nutrientName && n.nutrientName.toLowerCase().includes(nutrientName.toLowerCase())
      );
      return nutrient ? parseFloat(nutrient.value) : 0;
    };
    
    // Create food item in the format expected by the meal form
    const foodItem = {
      name: selectedFood.name,
      calories: getNutrientValue('energy') || getNutrientValue('calorie'),
      protein: getNutrientValue('protein'),
      carbs: getNutrientValue('carbohydrate'),
      fat: getNutrientValue('fat'),
      serving_size: `${quantity} serving`
    };
    
    // Call the callback function to add the food to the meal
    onAddFood(foodItem);
    
    // Reset component state
    setSelectedImage(null);
    setImagePreview(null);
    setRecognizedFoods([]);
    setSelectedFood(null);
    setNutritionData(null);
    setQuantity('1');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to handle manual search as fallback
  const handleManualSearch = async () => {
    if (!manualSearchQuery.trim()) {
      setError("Please enter a food name to search");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await mealService.analyzeNutrition(manualSearchQuery);
      
      if (response.data.foods && response.data.foods.length > 0) {
        // Create a structure similar to Clarifai response
        const mockRecognizedFoods = response.data.foods.map(food => ({
          name: food.description || manualSearchQuery,
          confidence: 100 // Manual search is 100% confidence since user entered it directly
        }));
        
        setRecognizedFoods(mockRecognizedFoods);
        setSelectedFood(mockRecognizedFoods[0]); // Auto-select the first item
        
        // Also set the nutrition data
        setNutritionData(response);
      } else {
        setError("No foods found matching your search term");
      }
    } catch (err) {
      console.error("Error in manual search:", err);
      setError("Failed to search for food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle to manual search mode
  const enableManualSearch = () => {
    setSearchMode(true);
    setError('');
  };

  // Toggle back to image recognition
  const enableImageRecognition = () => {
    setSearchMode(false);
    setError('');
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Food Image Recognition
      </Typography>
      
      <Tabs 
        value={searchMode ? 1 : 0} 
        onChange={(e, newValue) => newValue === 1 ? enableManualSearch() : enableImageRecognition()}
        sx={{ mb: 2 }}
      >
        <Tab label="Image Upload" />
        <Tab label="Manual Search" />
      </Tabs>
      
      {searchMode ? (
        // Manual Search UI
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField 
                fullWidth
                label="Search for a food item"
                placeholder="e.g. apple, banana, chicken breast"
                value={manualSearchQuery}
                onChange={(e) => setManualSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleManualSearch}
                disabled={loading || !manualSearchQuery.trim()}
                sx={{ height: '100%' }}
              >
                {loading ? 'Searching...' : 'Search Food'}
              </Button>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      ) : (
        // Image Recognition UI - Keep the existing UI
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 240,
                backgroundColor: '#f5f5f5',
                border: '1px dashed #ccc'
              }}
            >
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Food preview" 
                    style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }} 
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                    >
                      Change Image
                      <VisuallyHiddenInput 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleRecognizeFood}
                      disabled={recognizing}
                      startIcon={recognizing ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
                    >
                      {recognizing ? 'Recognizing...' : 'Recognize Food'}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <PhotoCameraIcon sx={{ fontSize: 48, color: '#aaa', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Upload a photo of your food to analyze
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                  >
                    Upload Image
                    <VisuallyHiddenInput 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      ref={fileInputRef}
                    />
                  </Button>
                </>
              )}
            </Paper>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
                {error.includes('API key') && (
                  <Box sx={{ mt: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={enableManualSearch}
                      sx={{ mt: 1 }}
                    >
                      Try Manual Search Instead
                    </Button>
                  </Box>
                )}
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {recognizedFoods.length > 0 ? (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recognized Foods:
                </Typography>
                <List>
                  {recognizedFoods.map((food, index) => (
                    <React.Fragment key={index}>
                      <ListItem 
                        button 
                        onClick={() => handleFoodSelection(food)}
                        selected={selectedFood?.name === food.name}
                      >
                        <ListItemText 
                          primary={food.name} 
                          secondary={`Confidence: ${food.confidence}%`} 
                        />
                        <Chip 
                          label="Select" 
                          color={selectedFood?.name === food.name ? "primary" : "default"}
                          size="small"
                        />
                      </ListItem>
                      {index < recognizedFoods.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                {selectedFood && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="text"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          size="small"
                          placeholder="e.g. 1, 2, 100g"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Button 
                          fullWidth
                          variant="contained" 
                          onClick={handleGetNutrition}
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : 'Get Nutrition'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            ) : imagePreview && !recognizing ? (
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography>
                  Click "Recognize Food" to analyze the image
                </Typography>
              </Paper>
            ) : null}
            
            {nutritionData && nutritionData.foods && nutritionData.foods.length > 0 && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Nutrition Information:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedFood.name} ({quantity})
                  </Typography>
                  
                  {nutritionData.foods[0].foodNutrients && (
                    <Box sx={{ mt: 1 }}>
                      {nutritionData.foods[0].foodNutrients
                        .filter(nutrient => 
                          nutrient.nutrientName && 
                          ['Energy', 'Protein', 'Carbohydrate', 'Fat'].some(n => 
                            nutrient.nutrientName.toLowerCase().includes(n.toLowerCase())
                          )
                        )
                        .map((nutrient, index) => (
                          <Typography key={index} variant="body2">
                            {nutrient.nutrientName}: {nutrient.value} {nutrient.unitName}
                          </Typography>
                        ))
                      }
                    </Box>
                  )}
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAddToMeal}
                >
                  Add to Meal
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FoodImageRecognition; 