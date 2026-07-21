import React from 'react';
import { Box, Typography, IconButton, Paper, Button, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { WishlistItem as WishlistItemType } from '../services/wishlistService';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: (itemId: number) => Promise<void>;
  onMoveToCart: (itemId: number) => Promise<void>;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, onMoveToCart }) => {
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
          <Typography variant="body2" color="primary" sx={{ fontWeight: 700, mt: 0.5 }}>
            ${item.productPrice.toFixed(2)}
          </Typography>
        </Grid>

        {/* Actions (Move to Cart and Delete) */}
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartIcon />}
            onClick={() => onMoveToCart(item.id)}
            sx={{ fontWeight: 600 }}
          >
            Move to Cart
          </Button>
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

export default WishlistItem;
