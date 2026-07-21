import axiosInstance from '../api/axiosInstance';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl?: string;
  quantity: number;
  subTotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalPrice: number;
}

export const getCart = async (): Promise<Cart> => {
  const response = await axiosInstance.get<Cart>('/cart');
  return response.data;
};

export const addToCart = async (productId: number, quantity: number): Promise<Cart> => {
  const response = await axiosInstance.post<Cart>('/cart/items', { productId, quantity });
  return response.data;
};

export const updateCartItemQuantity = async (itemId: number, quantity: number): Promise<Cart> => {
  const response = await axiosInstance.put<Cart>(`/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (itemId: number): Promise<Cart> => {
  const response = await axiosInstance.delete<Cart>(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async (): Promise<Cart> => {
  const response = await axiosInstance.delete<Cart>('/cart');
  return response.data;
};
