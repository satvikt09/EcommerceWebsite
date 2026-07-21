import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ReceiptIcon from '@mui/icons-material/Receipt';
import type { OrderResponse } from '../services/orderService';

interface OrderCardProps {
  order: OrderResponse;
  onViewDetails: (orderId: number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails }) => {
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
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Order Header / Icon */}
          <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                bgcolor: 'action.hover',
                p: 1.5,
                borderRadius: '50%',
                display: 'inline-flex',
                color: 'text.secondary'
              }}
            >
              <ReceiptIcon />
            </Box>
          </Grid>

          {/* Order meta */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Order Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              #{order.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Placed on {formatDate(order.orderDate)}
            </Typography>
          </Grid>

          {/* Details (Total Price, items) */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Items
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 750 }}>
              ${order.totalAmount.toFixed(2)}
            </Typography>
          </Grid>

          {/* Status Badge & Actions */}
          <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Chip
              label={order.status}
              color={getStatusColor(order.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewDetails(order.id)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              View Details
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
