import axiosInstance from '../api/axiosInstance';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  shippingAddress: string;
}

export interface CheckoutRequest {
  shippingAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  paymentMethod: string;
}

export interface CheckoutResponse {
  orderId: number;
  total: number;
  orderStatus: string;
  orderDate: string;
}

export const placeOrder = async (shippingAddress: string): Promise<OrderResponse> => {
  const response = await axiosInstance.post<OrderResponse>('/orders/checkout', { shippingAddress });
  return response.data;
};

export const realCheckout = async (checkoutData: CheckoutRequest): Promise<CheckoutResponse> => {
  const response = await axiosInstance.post<CheckoutResponse>('/checkout', checkoutData);
  return response.data;
};

export const getOrderById = async (id: number): Promise<OrderResponse> => {
  const response = await axiosInstance.get<OrderResponse>(`/orders/${id}`);
  return response.data;
};

export const getOrderHistory = async (): Promise<OrderResponse[]> => {
  const response = await axiosInstance.get<OrderResponse[]>('/orders');
  return response.data;
};

export const cancelOrder = async (id: number): Promise<OrderResponse> => {
  const response = await axiosInstance.post<OrderResponse>(`/orders/${id}/cancel`);
  return response.data;
};
