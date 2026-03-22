import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Chip,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { SITE_IMAGES } from '../constants/siteImages';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box>
      <Box
        sx={{
          color: 'common.white',
          py: { xs: 6, md: 10 },
          background: `linear-gradient(125deg, rgba(27, 67, 50, 0.94) 0%, rgba(45, 106, 79, 0.78) 48%, rgba(27, 67, 50, 0.55) 100%), url(${SITE_IMAGES.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
                label="Smart meal logging"
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: 'common.white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.25)',
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
                Track Your Nutrition
              </Typography>
              <Typography variant="h5" paragraph sx={{ opacity: 0.95, fontWeight: 400, lineHeight: 1.5 }}>
                Easily log your meals and monitor your nutritional intake with a calm, focused experience.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  component={Link}
                  to="/register"
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{ borderColor: 'rgba(255,255,255,0.55)', '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.08)' } }}
                >
                  Log In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: { xs: 260, sm: 340 },
                  width: '100%',
                  background: `url(${SITE_IMAGES.hero}) center/cover`,
                  border: '1px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: 2 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
              Features
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, mb: 2 }}>
              Everything in one place
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
              Everything you need to track your nutrition and stay consistent.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(8, 28, 21, 0.12)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={SITE_IMAGES.featureMeals}
                  alt="Colorful salad bowl representing meal tracking"
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 700 }}>
                    Meal Tracking
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    Log your meals and get detailed nutritional information using natural language input.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(8, 28, 21, 0.12)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={SITE_IMAGES.featureNutrition}
                  alt="Healthy toast with avocado representing nutrition analysis"
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 700 }}>
                    Nutrition Analysis
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    Get detailed breakdown of calories, macros, and other nutrients for everything you eat.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(8, 28, 21, 0.12)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={SITE_IMAGES.featureProgress}
                  alt="Active lifestyle representing progress tracking"
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 700 }}>
                    Progress Tracking
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    Monitor your nutrition progress over time and get personalized recommendations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 10 },
          background: `linear-gradient(125deg, rgba(27, 67, 50, 0.92), rgba(45, 106, 79, 0.85)), url(${SITE_IMAGES.cta})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'common.white',
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Ready to start your nutrition journey?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.95, maxWidth: 480, mx: 'auto', lineHeight: 1.65 }}>
            Create a free account and start logging meals in minutes.
          </Typography>
          <Button variant="contained" size="large" color="secondary" component={Link} to="/register">
            Create Account
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
