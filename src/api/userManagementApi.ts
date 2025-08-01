import axios from "axios";
import type { User, UserListResponse, UserResponse } from "../types/userManagementTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for auth headers
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

// Fetch all users (both active and inactive)
export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get<UserListResponse>(
    `${API_BASE_URL}/api/all-users`,
    getAuthHeaders()
  );
  return response.data.data;
};

// Fetch only active users
export const fetchActiveUsers = async (): Promise<User[]> => {
  const response = await axios.get<UserListResponse>(
    `${API_BASE_URL}/api/active-users`,
    getAuthHeaders()
  );
  return response.data.data;
};

// Fetch only inactive users
export const fetchInactiveUsers = async (): Promise<User[]> => {
  const response = await axios.get<UserListResponse>(
    `${API_BASE_URL}/api/inactive-users`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const createUser = async (userData: User): Promise<User> => {
  const response = await axios.post<UserResponse>(
    `${API_BASE_URL}/api/user-create`,
    userData,
    getAuthHeaders()
  );
  return response.data.data;
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const response = await axios.post<UserResponse>(
    `${API_BASE_URL}/api/user/${id}/update`,
    userData,
    getAuthHeaders()
  );
  return response.data.data;
};

export const deactivateUser = async (id: number): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/api/user/${id}/deactivate`,
    {},
    getAuthHeaders()
  );
};

export const activateUser = async (id: number): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/api/user/${id}/activate`,
    {},
    getAuthHeaders()
  );
};

export const searchUsers = async (searchTerm: string, _activeTab?: string): Promise<User[]> => {
  const response = await axios.post<UserListResponse>(
    `${API_BASE_URL}/api/user/search`,
    { keyword: searchTerm },
    getAuthHeaders()
  );
  return response.data.data;
};

// Additional API functions for bulk operations
export const bulkDeactivateUsers = async (ids: number[]): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/api/users/bulk-deactivate`,
    { user_ids: ids },
    getAuthHeaders()
  );
};

export const bulkActivateUsers = async (ids: number[]): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/api/users/bulk-activate`,
    { user_ids: ids },
    getAuthHeaders()
  );
};