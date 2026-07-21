import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';

const ServerError500: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        <Box sx={{ color: 'error.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
          <CloudOffIcon sx={{ fontSize: 72 }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          500 - Server Connection Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          We encountered an issue communicating with the e-commerce backend server. Please verify your backend server is running and try again.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ServerError500;
