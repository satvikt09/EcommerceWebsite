import axiosInstance from '../api/axiosInstance';

export interface AdminUserResponse {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  orderCount: number;
  registrationDate: string;
}

export const getAllUsers = async (): Promise<AdminUserResponse[]> => {
  const response = await axiosInstance.get<AdminUserResponse[]>('/admin/users');
  return response.data;
};

export const updateUserRole = async (id: number, role: 'USER' | 'ADMIN'): Promise<AdminUserResponse> => {
  const response = await axiosInstance.put<AdminUserResponse>(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const updateUserStatus = async (id: number, enabled: boolean): Promise<AdminUserResponse> => {
  const response = await axiosInstance.put<AdminUserResponse>(`/admin/users/${id}/status`, { enabled });
  return response.data;
};
