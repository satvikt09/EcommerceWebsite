import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Skeleton,
  Snackbar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { getOrderById, type OrderResponse } from '../services/orderService';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Missing order ID');
        setLoading(false);
        return;
      }
      const parsedId = parseInt(orderId, 10);
      if (isNaN(parsedId)) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getOrderById(parsedId);
        setOrder(data);
      } catch (err: any) {
        setError('Failed to fetch placed order details, but your order has been received.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 3 }} />
        <Skeleton width="60%" height={40} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton width="40%" height={24} sx={{ mx: 'auto', mb: 4 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error || 'Could not retrieve order details.'}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
          <Button variant="outlined" onClick={() => navigate('/orders')}>
            View My Orders
          </Button>
        </Box>
      </Container>
    );
  }

  // Helper to format Date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center', mb: 4 }}>
        {/* Success Icon */}
        <Box sx={{ mb: 3 }}>
          <CheckCircleOutlineIcon
            color="success"
            sx={{
              fontSize: 90,
              animation: 'popIn 0.5s ease-out',
              '@keyframes popIn': {
                '0%': { transform: 'scale(0.5)', opacity: 0 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          />
        </Box>

        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'success.main', mb: 1 }}>
          Thank You For Your Order!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Your order has been placed successfully and is being processed.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Order Meta details */}
        <Grid container spacing={3} sx={{ textAlign: 'left', mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>#{order.id}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">Date Placed</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatDate(order.orderDate)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">Order Status</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{order.status}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">Shipping Details</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5, lineHeight: 1.5 }}>
              {order.shippingAddress}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* Order Items Invoice list */}
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'left', mb: 2 }}>
          Order Items Receipt
        </Typography>

        <List disablePadding sx={{ mb: 3 }}>
          {order.items.map((item) => (
            <ListItem key={item.id} sx={{ py: 1.5, px: 0, textAlign: 'left' }}>
              <ListItemText
                primary={item.productName}
                secondary={`Qty: ${item.quantity} x $${item.productPrice.toFixed(2)}`}
              />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                ${item.subtotal.toFixed(2)}
              </Typography>
            </ListItem>
          ))}

          <Divider sx={{ my: 1.5 }} />

          <ListItem sx={{ px: 0, justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total Paid</Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
              ${order.totalAmount.toFixed(2)}
            </Typography>
          </ListItem>
        </List>

        {/* Page navigation options */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ShoppingBagIcon />}
            onClick={() => navigate('/')}
            sx={{ px: 4 }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            startIcon={<ReceiptLongIcon />}
            onClick={() => navigate('/orders')}
            sx={{ px: 4 }}
          >
            View My Orders
          </Button>
        </Box>
      </Paper>

      {/* Feedback Snackbars */}
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarMessage(null)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderSuccessPage;
