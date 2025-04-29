import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Card, CardContent, CardMedia } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import logoImage from '../assets/images/logo.svg';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              {/* Logo and Title */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  mb: 3
                }}
              >
                <img 
                  src={logoImage} 
                  alt="Nutrition Analyzer Logo" 
                  style={{ 
                    maxWidth: '85%', 
                    height: 'auto', 
                    marginBottom: '16px' 
                  }} 
                />
              </Box>
              
              {/* Call to action buttons */}
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  color="secondary" 
                  component={Link} 
                  to="/register"
                  sx={{ mr: 2 }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                >
                  Log In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={6}
                sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  height: 300, 
                  width: '100%', 
                  background: 'url(https://source.unsplash.com/random/?healthy,food) center/cover' 
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Features
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Everything you need to track your nutrition and achieve your goals
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Meal Tracking
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Log your meals and get detailed nutritional information using natural language input.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Nutrition Analysis
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get detailed breakdown of calories, macros, and other nutrients for everything you eat.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Progress Tracking
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Monitor your nutrition progress over time and get personalized recommendations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Call To Action */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to start your nutrition journey?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              color="primary" 
              component={Link} 
              to="/register"
            >
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 