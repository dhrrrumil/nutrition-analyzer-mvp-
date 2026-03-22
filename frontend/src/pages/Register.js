import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link as MuiLink,
  Grid,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { SITE_IMAGES } from '../constants/siteImages';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await register(username, password);
      if (result.success) {
        navigate('/login', { state: { message: 'Registration successful! You can now log in.' } });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: 'calc(100vh - 64px)' }}>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark}cc 0%, ${theme.palette.primary.main}99 100%), url(${SITE_IMAGES.authRegister})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 4,
            color: 'common.white',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Eat smarter, feel better
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: 400 }}>
            Join today and get insights into every meal you log.
          </Typography>
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, md: 6 },
          px: 2,
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            maxWidth: 420,
            width: '100%',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 40px rgba(8, 28, 21, 0.08)',
          }}
        >
          <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Start tracking meals in a few steps
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <Typography variant="body2" align="center">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login">
                Login here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Register;
