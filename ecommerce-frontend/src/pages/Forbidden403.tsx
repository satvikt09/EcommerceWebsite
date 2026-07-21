import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Forbidden403: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        <Box sx={{ color: 'warning.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
          <LockOutlinedIcon sx={{ fontSize: 72 }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          403 - Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          You do not have the necessary administrator permissions to view this resource. Please log in with an authorized account or navigate back to the store catalog.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
            Switch Account
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Forbidden403;
