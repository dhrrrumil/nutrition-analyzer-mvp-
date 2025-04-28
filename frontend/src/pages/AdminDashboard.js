import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, CircularProgress, Alert, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    userCount: 0,
    mealCount: 0,
    activeUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  
  // For delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // For user meal view
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMeals, setUserMeals] = useState([]);
  const [userMealsLoading, setUserMealsLoading] = useState(false);

  useEffect(() => {
    // If not admin, redirect to home
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // Load admin data
    fetchAdminData();
  }, [isAdmin, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch stats
      const statsResponse = await adminService.getStats();
      setStats(statsResponse.data);
      
      // Fetch users
      const usersResponse = await adminService.getUsers();
      setUsers(usersResponse.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    try {
      await adminService.deleteUser(userToDelete._id);
      setSuccessMessage(`User ${userToDelete.username} deleted successfully`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      // Refresh stats
      const statsResponse = await adminService.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      setError("Failed to delete user. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewUserMeals = async (userId) => {
    setUserMealsLoading(true);
    setSelectedUser(users.find(u => u._id === userId));
    
    try {
      const response = await adminService.getUserMeals(userId);
      setUserMeals(response.data);
    } catch (err) {
      console.error("Error fetching user meals:", err);
      setError("Failed to load user's meals.");
    } finally {
      setUserMealsLoading(false);
    }
  };
  
  const closeUserMeals = () => {
    setSelectedUser(null);
    setUserMeals([]);
  };

  if (!isAdmin) {
    return <Alert severity="error">You do not have permission to access this page.</Alert>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your nutrition analyzer application
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Dashboard" />
        <Tab label="User Management" />
      </Tabs>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedTab === 0 ? (
        // Dashboard Tab
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Paper sx={{ p: 3, width: '100%', maxWidth: 250 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">{stats.userCount}</Typography>
          </Paper>
          
          <Paper sx={{ p: 3, width: '100%', maxWidth: 250 }}>
            <Typography variant="h6">Total Meals</Typography>
            <Typography variant="h3">{stats.mealCount}</Typography>
          </Paper>
          
          <Paper sx={{ p: 3, width: '100%', maxWidth: 250 }}>
            <Typography variant="h6">Active Users</Typography>
            <Typography variant="h3">{stats.active_users || stats.activeUsers}</Typography>
          </Paper>
        </Box>
      ) : (
        // User Management Tab
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.is_admin ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleViewUserMeals(user._id)}
                      sx={{ mr: 1 }}
                    >
                      View Meals
                    </Button>
                    {!user.is_admin && (
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{userToDelete?.username}"? 
            This will also delete all their meal data and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteUser} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* User Meals Dialog */}
      <Dialog
        open={!!selectedUser}
        onClose={closeUserMeals}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Meals for {selectedUser?.username}</DialogTitle>
        <DialogContent>
          {userMealsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : userMeals.length === 0 ? (
            <DialogContentText>
              This user has not logged any meals yet.
            </DialogContentText>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userMeals.map((meal) => (
                    <TableRow key={meal._id}>
                      <TableCell>{meal.name}</TableCell>
                      <TableCell>{meal.meal_type}</TableCell>
                      <TableCell>{new Date(meal.date).toLocaleDateString()}</TableCell>
                      <TableCell>{meal.items?.length || 0} items</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUserMeals}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 