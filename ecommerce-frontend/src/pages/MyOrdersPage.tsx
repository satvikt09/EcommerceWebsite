import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  Snackbar,
  Button,
  InputAdornment,
  Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../context/AuthContext';
import { getOrderHistory, type OrderResponse } from '../services/orderService';
import OrderCard from '../components/OrderCard';
import BreadcrumbHeader from '../components/BreadcrumbHeader';
import EmptyState from '../components/EmptyState';

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderHistory();
      const sorted = data.sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please sign in to view your orders.');
      } else {
        setError('Failed to retrieve your order history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setError('Authentication required. Please sign in to view your orders.');
        setLoading(false);
      } else {
        fetchOrders();
      }
    }
  }, [user, authLoading]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery.trim() === '' || order.id.toString().includes(searchQuery.trim());
    
    const filterStatus = statusFilters[activeTab];
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Skeleton width="30%" height={40} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={48} sx={{ mb: 4, borderRadius: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from(new Array(3)).map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          {!user ? (
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
              Back to Shop
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Fade in timeout={400}>
      <Container maxWidth="md" sx={{ mt: 2, mb: 6 }}>
        <BreadcrumbHeader items={[{ label: 'My Orders' }]} />

        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
          My Order History
        </Typography>

        {/* Search Order Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Search by Order ID"
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter numeric order ID..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Box>

        {/* Status Filters tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Order status filters"
          >
            <Tab label="All Orders" />
            <Tab label="Pending" />
            <Tab label="Processing" />
            <Tab label="Shipped" />
            <Tab label="Delivered" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>

        {/* Orders List / Empty State */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<InboxIcon sx={{ fontSize: 72 }} />}
            title="No Orders Found"
            description={
              orders.length === 0
                ? "You haven't placed any orders yet. Start shopping and track your orders here!"
                : 'No orders match your current search criteria or status filter.'
            }
            actionLabel="Start Shopping"
            onAction={() => navigate('/')}
          />
        ) : (
          <Box>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
              />
            ))}
          </Box>
        )}

        <Snackbar
          open={snackbarMessage !== null}
          autoHideDuration={4000}
          onClose={() => setSnackbarMessage(null)}
          message={snackbarMessage}
        />
      </Container>
    </Fade>
  );
};

export default MyOrdersPage;
