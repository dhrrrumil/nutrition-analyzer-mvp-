import React, { useState, useEffect } from 'react';
import { Container, Box, Alert, CircularProgress, Button } from '@mui/material';
import { progressService } from '../services/api';
import ProgressDisplay from '../components/ProgressDisplay';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageBanner from '../components/PageBanner';
import { SITE_IMAGES } from '../constants/siteImages';

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
      <Box sx={{ mt: 3, mb: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <PageBanner
            title="Nutrition Progress"
            subtitle="See how your habits trend over time and act on personalized recommendations."
            imageSrc={SITE_IMAGES.progressHeader}
          />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 2,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            Refresh
          </Button>
        </Box>
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'flex-end', mb: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading} size="small">
            Refresh
          </Button>
        </Box>
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