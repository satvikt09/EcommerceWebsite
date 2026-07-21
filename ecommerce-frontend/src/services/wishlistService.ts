import axiosInstance from '../api/axiosInstance';

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl?: string;
}

export interface Wishlist {
  id: number;
  userId: number;
  items: WishlistItem[];
}

export const getWishlist = async (): Promise<Wishlist> => {
  const response = await axiosInstance.get<Wishlist>('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId: number): Promise<Wishlist> => {
  const response = await axiosInstance.post<Wishlist>('/wishlist/items', { productId });
  return response.data;
};

export const removeFromWishlist = async (itemId: number): Promise<Wishlist> => {
  const response = await axiosInstance.delete<Wishlist>(`/wishlist/items/${itemId}`);
  return response.data;
};

export const clearWishlist = async (): Promise<Wishlist> => {
  const response = await axiosInstance.delete<Wishlist>('/wishlist');
  return response.data;
};

export const moveToCart = async (itemId: number): Promise<Wishlist> => {
  const response = await axiosInstance.post<Wishlist>(`/wishlist/items/${itemId}/move-to-cart`);
  return response.data;
};
