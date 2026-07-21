import axiosInstance from '../api/axiosInstance';

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const response = await axiosInstance.get<CategoryResponse[]>('/categories');
  return response.data;
};

export const createCategory = async (categoryData: CategoryRequest): Promise<CategoryResponse> => {
  const response = await axiosInstance.post<CategoryResponse>('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: number, categoryData: CategoryRequest): Promise<CategoryResponse> => {
  const response = await axiosInstance.put<CategoryResponse>(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/categories/${id}`);
};
