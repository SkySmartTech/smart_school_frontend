import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TeacherData {
  id: number;
  teacherGrades: string[];
  teacherClass: string[];
  subjects: string[];
  staffNo: string;
  medium: string[];
  userId: string;
  userType: string;
  userRole: string;
  modifiedBy: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: number;
  name: string;
  address: string;
  email: string;
  birthDay: string;
  contact: string;
  userType: string;
  gender: string;
  location: string;
  username: string;
  photo: string | null;
  userRole: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  teacher_data: TeacherData;
  access: any[];
}

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');
  if (!token) {
    return null;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

const fetchTeacherProfile = async (): Promise<UserProfile> => {
  const headers = getAuthHeader();
  if (!headers) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/user`, headers);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error('Failed to fetch teacher profile');
  }
};

export const useTeacherProfile = () => {
  const authHeader = getAuthHeader();
  
  return useQuery<UserProfile, Error>({
    queryKey: ['teacherProfile'],
    queryFn: fetchTeacherProfile,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
    enabled: !!authHeader, // Only run the query if we have an auth token
  });
};

export default useTeacherProfile;
