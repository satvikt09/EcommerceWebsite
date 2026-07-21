import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
  Snackbar,
  Alert,
  Avatar,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useAuth } from '../context/AuthContext';
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  type AdminUserResponse
} from '../services/adminUserService';

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Detail Modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Access denied. Administrator privileges are required.');
      } else {
        setError('Failed to retrieve user registry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        setError('Access denied. Administrator privileges are required.');
        setLoading(false);
      } else {
        fetchUsers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading]);

  // Tab navigation index
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('/admin/analytics');
    if (newValue === 1) navigate('/admin/products');
    if (newValue === 2) navigate('/admin/categories');
    if (newValue === 3) navigate('/admin/users');
  };

  // Change user role
  const handleRoleChange = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSnackbarMessage(`Role changed successfully to ${newRole}`);
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to update user role.');
      setSnackbarSeverity('error');
    }
  };

  // Change user enable status
  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      const updated = await updateUserStatus(userId, !currentStatus);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSnackbarMessage(`User status ${!currentStatus ? 'enabled' : 'disabled'}.`);
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to toggle user status.');
      setSnackbarSeverity('error');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filters logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton width="40%" height={40} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Tab Navigation Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={3} onChange={handleTabChange} aria-label="admin navigation panels">
          <Tab label="Analytics" sx={{ fontWeight: 600 }} />
          <Tab label="Products" sx={{ fontWeight: 600 }} />
          <Tab label="Categories" sx={{ fontWeight: 600 }} />
          <Tab label="Users" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* User Management Header */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        User Management
      </Typography>

      {/* Filter Options */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Search User Name / Email"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="role-filter-label">Filter Role</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter-select"
                value={roleFilter}
                label="Filter Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="USER">User Only</MenuItem>
                <MenuItem value="ADMIN">Admin Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Users table */}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table aria-label="users table">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Profile</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Active Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Orders Count</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Registration Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 600 }}>
                      {getInitials(u.fullName)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {u.fullName}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <FormControl size="small" variant="standard" sx={{ minWidth: 90 }}>
                    <Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as 'USER' | 'ADMIN')}
                      sx={{ fontSize: '0.875rem' }}
                      disabled={u.email === currentUser?.email} // Avoid locking out self
                    >
                      <MenuItem value="USER">USER</MenuItem>
                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={u.enabled}
                    onChange={() => handleStatusToggle(u.id, u.enabled)}
                    color="primary"
                    disabled={u.email === currentUser?.email} // Avoid disabling self
                    inputProps={{ 'aria-label': 'toggle active status' }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{u.orderCount}</TableCell>
                <TableCell>{formatDate(u.registrationDate)}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setSelectedUser(u)}
                    aria-label="View user profile"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Profile Detail Dialog */}
      <Dialog open={selectedUser !== null} onClose={() => setSelectedUser(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>User Profile Details</DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {selectedUser && (
            <Stack spacing={2.5} alignItems="center" sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 70,
                  height: 70,
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  boxShadow: 2
                }}
              >
                {getInitials(selectedUser.fullName)}
              </Avatar>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedUser.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Box>

              <Divider sx={{ width: '100%' }} />

              <Stack direction="row" spacing={3} sx={{ width: '100%', justifyContent: 'space-around' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Role</Typography>
                  <Chip label={selectedUser.role} color="info" size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                  <Chip
                    label={selectedUser.enabled ? 'Active' : 'Disabled'}
                    color={selectedUser.enabled ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 600 }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ width: '100%' }} />

              <Box sx={{ width: '100%', textAlign: 'left', px: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Registration Date:</strong> {formatDate(selectedUser.registrationDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Placed Orders:</strong> {selectedUser.orderCount}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedUser(null)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification alerts */}
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUsersPage;
