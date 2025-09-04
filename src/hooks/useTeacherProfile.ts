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
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

const fetchTeacherProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user`, getAuthHeader());
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error('Failed to fetch teacher profile');
  }
};

export const useTeacherProfile = () => {
  return useQuery<UserProfile, Error>({
    queryKey: ['teacherProfile'],
    queryFn: fetchTeacherProfile,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

export default useTeacherProfile;
