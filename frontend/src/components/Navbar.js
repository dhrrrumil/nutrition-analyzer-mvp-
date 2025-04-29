import React from 'react';
import { AppBar, Box, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import logoSmall from '../assets/images/logo-small.svg';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src={logoSmall} 
              alt="Nutrition Analyzer Logo" 
              style={{ height: '40px', marginRight: '10px' }} 
            />
            <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white' }}>
              Nutrition Analyzer
            </Typography>
          </Box>
          <Box>
            {isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/dashboard">
                  Dashboard
                </Button>
                <Button color="inherit" component={Link} to="/meals">
                  Meals
                </Button>
                <Button color="inherit" component={Link} to="/progress">
                  Progress
                </Button>
                {isAdmin && (
                  <Button color="inherit" component={Link} to="/admin">
                    Admin
                  </Button>
                )}
                <Button color="inherit" onClick={handleLogout}>
                  Logout ({user?.username})
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 