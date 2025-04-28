import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, CircularProgress, Button } from '@mui/material';
import { progressService } from '../services/api';
import ProgressDisplay from '../components/ProgressDisplay';
import RefreshIcon from '@mui/icons-material/Refresh';

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [progressResponse, recommendationsResponse] = await Promise.all([
        progressService.getProgress(),
        progressService.getRecommendations()
      ]);
      
      setProgressData(progressResponse.data);
      setRecommendations(recommendationsResponse.data);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Nutrition Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Track your nutrition progress over time
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <ProgressDisplay 
          progressData={progressData} 
          recommendations={recommendations}
        />
      )}
    </Container>
  );
};

export default Progress; 