import React from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Chip,
  Divider,
  Stack,
  Fade,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ShieldIcon from '@mui/icons-material/Shield';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../context/AuthContext';
import BreadcrumbHeader from '../components/BreadcrumbHeader';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Sign In Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please sign in to access your personal profile and account settings.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Fade in timeout={400}>
      <Container maxWidth="md" sx={{ mt: 2, mb: 6 }}>
        <BreadcrumbHeader items={[{ label: 'Profile Settings' }]} />

        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
          Account Settings
        </Typography>

        <Grid container spacing={4}>
          {/* User Info Overview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 84,
                  height: 84,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 800,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: 2,
                }}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>

              <Chip
                label={user.role}
                color={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                variant="outlined"
                sx={{ fontWeight: 700, mb: 3 }}
              />

              <Divider sx={{ mb: 3 }} />

              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </Paper>
          </Grid>

          {/* Account Details & Quick Shortcuts */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Personal Details
              </Typography>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user.fullName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main' }}>
                    <EmailIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main' }}>
                    <ShieldIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Account Status & Role
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Active Member ({user.role})
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* Quick Shortcuts */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Quick Account Shortcuts
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShoppingBagIcon />}
                    onClick={() => navigate('/orders')}
                    sx={{ py: 1.2, borderRadius: 2 }}
                  >
                    View Order History
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<FavoriteIcon />}
                    onClick={() => navigate('/wishlist')}
                    sx={{ py: 1.2, borderRadius: 2 }}
                  >
                    Saved Wishlist
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default Profile;
