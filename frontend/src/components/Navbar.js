import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const authLinks = isAuthenticated
    ? [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Meals', to: '/meals' },
        { label: 'Progress', to: '/progress' },
        ...(isAdmin ? [{ label: 'Admin', to: '/admin' }] : []),
      ]
    : [
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 }, py: 0.5 }}>
          <RestaurantRoundedIcon sx={{ mr: 1, opacity: 0.95, fontSize: 28 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              mr: { md: 4 },
              textDecoration: 'none',
              color: 'common.white',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            Nutrition Analyzer
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
              {authLinks.map(({ label, to }) => (
                <Button
                  key={to}
                  color="inherit"
                  component={Link}
                  to={to}
                  sx={{
                    px: 1.5,
                    borderRadius: 2,
                    opacity: 0.92,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', opacity: 1 },
                  }}
                >
                  {label}
                </Button>
              ))}
              {isAuthenticated && (
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    ml: 1,
                    px: 1.5,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.35)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Log out · {user?.username}
                </Button>
              )}
            </Box>
          )}

          {isMobile && (
            <>
              <IconButton
                color="inherit"
                edge="end"
                aria-label="menu"
                aria-controls={open ? 'nav-menu' : undefined}
                aria-haspopup="true"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="nav-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 200, borderRadius: 2, mt: 1 } }}
              >
                {authLinks.map(({ label, to }) => (
                  <MenuItem
                    key={to}
                    component={Link}
                    to={to}
                    onClick={() => setAnchorEl(null)}
                  >
                    {label}
                  </MenuItem>
                ))}
                {isAuthenticated && (
                  <MenuItem onClick={handleLogout}>
                    Log out ({user?.username})
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
