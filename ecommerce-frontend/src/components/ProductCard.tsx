import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  Chip,
  CardActionArea,
  Grow,
} from '@mui/material';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand?: string;
  imageUrl?: string;
  category: Category;
  averageRating?: number;
  reviewCount?: number;
  enabled?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Grow in timeout={400}>
      <Card
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <CardMedia
            component="img"
            height="210"
            image={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
              {product.category?.name || 'General'}
            </Typography>
            <Typography variant="h6" component="h2" sx={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly size="small" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                ({product.reviewCount || 0})
              </Typography>
            </Box>
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5 }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                ${product.price.toFixed(2)}
              </Typography>
              {isOutOfStock ? (
                <Chip label="Out of Stock" color="error" size="small" variant="filled" />
              ) : isLowStock ? (
                <Chip label={`Only ${product.stock} Left`} color="warning" size="small" variant="outlined" />
              ) : (
                <Chip label="In Stock" color="success" size="small" variant="outlined" />
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grow>
  );
};

export default ProductCard;
