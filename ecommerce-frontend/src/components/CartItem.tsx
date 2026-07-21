import React from 'react';
import { Box, Typography, IconButton, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CartItem as CartItemType } from '../services/cartService';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: number, quantity: number) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Product Image */}
        <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={item.imageUrl || 'https://via.placeholder.com/100?text=No+Image'}
            alt={item.productName}
            sx={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 1.5,
            }}
          />
        </Grid>

        {/* Product Name & Details */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {item.productName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unit Price: ${item.productPrice.toFixed(2)}
          </Typography>
        </Grid>

        {/* Quantity Controls */}
        <Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ border: '1px solid #ccc', borderRadius: 1, px: 1 }}>
            <IconButton
              size="small"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body1" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
              {item.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={handleIncrease}
              aria-label="Increase quantity"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Grid>

        {/* Total Price & Delete Button */}
        <Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
              ${item.subTotal.toFixed(2)}
            </Typography>
          </Box>
          <IconButton
            color="error"
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CartItem;
