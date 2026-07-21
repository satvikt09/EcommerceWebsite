import axiosInstance from '../api/axiosInstance';
import type { Product } from '../components/ProductCard';

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosInstance.get<Product>(`/products/${id}`);
  return response.data;
};

export const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>(`/products/category/${categoryId}`);
  return response.data;
};

export const addToCart = async (productId: number, quantity: number): Promise<any> => {
  const response = await axiosInstance.post('/cart/items', { productId, quantity });
  return response.data;
};

export const addToWishlist = async (productId: number): Promise<any> => {
  const response = await axiosInstance.post('/wishlist/items', { productId });
  return response.data;
};
