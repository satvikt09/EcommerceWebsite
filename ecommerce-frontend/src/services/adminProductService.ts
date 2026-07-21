import axiosInstance from '../api/axiosInstance';
import type { Product, Category } from '../components/ProductCard';

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  imageUrl: string;
  categoryId: number;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<Category[]>('/categories');
  return response.data;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>('/products');
  return response.data;
};

export const createProduct = async (productData: ProductRequest): Promise<Product> => {
  const response = await axiosInstance.post<Product>('/products', productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: ProductRequest): Promise<Product> => {
  const response = await axiosInstance.put<Product>(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/products/${id}`);
};

export const updateProductStock = async (id: number, stock: number): Promise<Product> => {
  const response = await axiosInstance.put<Product>(`/admin/products/${id}/stock`, { stock });
  return response.data;
};

export const toggleProductStatus = async (id: number, enabled: boolean): Promise<Product> => {
  const response = await axiosInstance.put<Product>(`/admin/products/${id}/status`, { enabled });
  return response.data;
};
