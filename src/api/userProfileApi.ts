// src/api/userProfileApi.ts
import axios from "axios";
import type { User, PhotoUploadResponse } from "../types/userTypes";

// Enhanced auth header function
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken') || 
                localStorage.getItem('token') || 
                localStorage.getItem('access_token');
  
  if (!token) {
    console.error('No authentication token found in localStorage');
    throw new Error('Authentication token not found. Please login again.');
  }

  console.log('Token found for user profile:', token ? 'Yes' : 'No');
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

// Create reusable Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Enhanced Request Interceptor
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("authToken") || 
                    localStorage.getItem("token") || 
                    localStorage.getItem("access_token");
      
      if (token && typeof token === "string" && token.trim()) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token attached to request:', config.url);
      } else {
        console.warn('No token found for request:', config.url);
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    const status = error.response?.status;

    if (status === 401) {
      console.log('401 Unauthorized - clearing tokens');
      // Clear all possible token storage keys
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refreshToken");
      
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        console.log('Redirecting to login page');
        window.location.href = "/login";
      }
    } else if (status === 403) {
      console.log('403 Forbidden - access denied');
    } else if (status >= 500) {
      console.log('Server error:', status);
    }

    return Promise.reject(error);
  }
);

// =========================
// API Methods
// =========================

// Fetch logged-in user profile
export const fetchUserProfile = async (): Promise<User> => {
  try {
    console.log('Fetching user profile...');
    
    // Use the enhanced auth header function
    const authConfig = getAuthHeader();
    const response = await api.get("/api/user", authConfig);
    
    console.log('User profile fetched successfully:', response.data);
    
    return {
      id: response.data.id,
      name: response.data.name || "",
      address: response.data.address || "",
      birthDay: response.data.birthDay || "",
      userType: response.data.userType || "",
      gender: response.data.gender || "",
      userRole: response.data.userRole || "",
      username: response.data.username || "",
      password: "********", // Masked
      email: response.data.email || "",
      location: response.data.location || "",
      grade: response.data.grade || "",
      contact: response.data.contact || "",
      photo: response.data.photo || "",
      subject: response.data.subject || "",
      class: response.data.class || "",
      epf: response.data.epf || "",
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to view this profile.');
      } else if (error.response?.status === 404) {
        throw new Error('User profile not found.');
      
      } else {
        throw new Error(
          error.response?.data?.message || 
          error.response?.data?.error ||
          'Failed to fetch user profile'
        );
      }
    } else if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Network error occurred while fetching profile');
  }
};

// Update user profile
export const updateUserProfile = async (
  id: number,
  userData: Partial<User>
): Promise<void> => {
  try {
    console.log('Updating user profile:', id, userData);
    
    if (!id || id <= 0) {
      throw new Error('Invalid user ID');
    }
    
    // Use the enhanced auth header function
    const authConfig = getAuthHeader();
    await api.put(`/api/user/${id}`, userData, authConfig);
    
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to update this profile.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 422) {
        throw new Error(
          error.response?.data?.message || 
          'Validation error. Please check your input data.'
        );
      
      } else {
        throw new Error(
          error.response?.data?.message || 
          error.response?.data?.error ||
          'Failed to update user profile'
        );
      }
    } else if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Network error occurred while updating profile');
  }
};

// Upload profile photo
export const uploadUserPhoto = async (file: File): Promise<string> => {
  try {
    console.log('Uploading user photo:', file.name, file.size);
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, GIF, or WebP).');
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File is too large. Please upload an image smaller than 5MB.');
    }
    
    const formData = new FormData();
    formData.append("photo", file);

    // Get auth headers but modify for multipart/form-data
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await api.post<PhotoUploadResponse>(
      "/api/user/photo",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          'Accept': 'application/json'
        },
        timeout: 30000, // 30 seconds for file upload
      }
    );

    console.log('Photo uploaded successfully:', response.data);
    
    if (!response.data.photoUrl) {
      throw new Error('Invalid response from server - no photo URL received');
    }

    return response.data.photoUrl;
  } catch (error) {
    console.error('Error uploading user photo:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to upload photos.');
      } else if (error.response?.status === 413) {
        throw new Error('File is too large. Please upload a smaller image.');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported file type. Please upload an image file.');
      } else {
        throw new Error(
          error.response?.data?.message || 
          error.response?.data?.error ||
          'Failed to upload photo'
        );
      }
    } else if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Network error occurred while uploading photo');
  }
};

// Optional: Check if user is authenticated
export const checkAuthStatus = (): boolean => {
  const token = localStorage.getItem('authToken') || 
                localStorage.getItem('token') || 
                localStorage.getItem('access_token');
  return !!token;
};

// Optional: Clear authentication data
export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refreshToken');
  console.log('Authentication data cleared');
};

export default api;