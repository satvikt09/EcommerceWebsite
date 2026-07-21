import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Skeleton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BlockIcon from '@mui/icons-material/Block';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';

import { useAuth } from '../context/AuthContext';
import { getOrderById, cancelOrder, type OrderResponse } from '../services/orderService';
import { addToCart } from '../services/productService';
import OrderTimeline from '../components/OrderTimeline';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Actions loading state
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Dialog state
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchOrderDetails = async () => {
    if (!orderId) return;
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
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please sign in to view this order.');
      } else {
        setError('Failed to retrieve order details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setError('Authentication required. Please sign in to view this order.');
        setLoading(false);
      } else {
        fetchOrderDetails();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, user, authLoading]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      setOpenCancelDialog(false);
      setSnackbarMessage('Order cancelled successfully.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to cancel order.');
      setSnackbarSeverity('error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyAgain = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      // Add items sequentially
      for (const item of order.items) {
        await addToCart(item.productId, item.quantity);
      }
      setSnackbarMessage('All items added back to your cart!');
      setSnackbarSeverity('success');
      setTimeout(() => navigate('/cart'), 1500);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to repurchase items.');
      setSnackbarSeverity('error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
        return 'secondary';
      case 'CONFIRMED':
        return 'primary';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Only allow cancellation if pending or confirmed
  const canCancel = order && (order.status === 'PENDING' || order.status === 'CONFIRMED');

  if (authLoading || loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Skeleton width="30%" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 4 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error || 'Could not load order details.'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          {!user ? (
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')}>
              Back to Orders
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header Back button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">Current Status:</Typography>
          <Chip
            label={order.status}
            color={getStatusColor(order.status)}
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Box>

      {/* Timeline tracker */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Order Journey
        </Typography>
        <OrderTimeline status={order.status} />
      </Paper>

      {/* Main Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Shipping address info */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Delivery Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {order.shippingAddress}
            </Typography>
          </Paper>
        </Grid>

        {/* Invoice Summary info */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Payment Invoice
            </Typography>
            <List disablePadding>
              <ListItem sx={{ py: 0.5, px: 0 }}>
                <ListItemText primary="Grand Total" />
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 750 }}>
                  ${order.totalAmount.toFixed(2)}
                </Typography>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem sx={{ py: 0.5, px: 0 }}>
                <ListItemText primary="Date Placed" secondary={formatDate(order.orderDate)} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Products list Accordion */}
      <Accordion defaultExpanded sx={{ mb: 4, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandMoreIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Order Items ({order.items.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <List disablePadding>
            {order.items.map((item) => (
              <Box key={item.id}>
                <ListItem sx={{ py: 2, px: 3 }}>
                  <ListItemText
                    primary={item.productName}
                    secondary={`Quantity: ${item.quantity} x $${item.productPrice.toFixed(2)}`}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ${item.subtotal.toFixed(2)}
                  </Typography>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons panel */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => navigate('/')}
          startIcon={<HomeIcon />}
          disabled={actionLoading}
        >
          Continue Shopping
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBuyAgain}
          startIcon={<ShoppingCartIcon />}
          disabled={actionLoading}
        >
          Buy Again
        </Button>
        {canCancel && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenCancelDialog(true)}
            startIcon={<BlockIcon />}
            disabled={actionLoading}
          >
            Cancel Order
          </Button>
        )}
      </Box>

      {/* Cancellation Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Your Order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel Order #{order.id}? This action cannot be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenCancelDialog(false)} disabled={actionLoading}>
            Discard
          </Button>
          <Button
            onClick={handleCancelOrder}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Cancelling...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
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

export default OrderDetailsPage;
