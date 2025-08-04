import axios from "axios";
import type { User, UserListResponse, UserResponse } from "../types/userManagementTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get<UserListResponse>(
    `${API_BASE_URL}/api/users`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const createUser = async (userData: User): Promise<User> => {
  const response = await axios.post<UserResponse>(
    `${API_BASE_URL}/api/users`,
    userData,
    getAuthHeaders()
  );
  return response.data.data;
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const response = await axios.put<UserResponse>(
    `${API_BASE_URL}/api/users/${id}`,
    userData,
    getAuthHeaders()
  );
  return response.data.data;
};

export const deactivateUser = async (id: number): Promise<void> => {
  await axios.patch(
    `${API_BASE_URL}/api/users/${id}/deactivate`,
    {},
    getAuthHeaders()
  );
};

export const searchUsers = async (searchTerm: string, userType?: string): Promise<User[]> => {
  const response = await axios.get<UserListResponse>(
    `${API_BASE_URL}/api/users/search`,
    {
      ...getAuthHeaders(),
      params: {
        keyword: searchTerm,
        userType
      }
    }
  );
  return response.data.data;
};

export const bulkDeactivateUsers = async (ids: number[]): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/api/users/bulk-deactivate`,
    { ids },
    getAuthHeaders()
  );
};