//src/api/addmarksApi.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types & Interfaces
export interface StudentMark {
  id: number;
  student_admission: string;
  student_name: string;
  student_grade: string;
  student_class: string;
  subject: string;
  term: string;
  marks: string;
  month?: string;
}

export interface FetchMarksFilters {
  grade?: string;
  class?: string;
  subject?: string;
  term?: string;
  month?: string;
  searchQuery?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

// Auth Helpers

// Enhanced auth header function with better error handling
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');

  if (!token) {
    console.error('No authentication token found in localStorage');
    // Check if user needs to login again
    throw new Error('Authentication token not found. Please login again.');
  }

  console.log('Token found:', token ? 'Yes' : 'No'); // Debug log

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};


// Error Handling

const handleApiError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);

  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 401:
        throw new Error("Authentication failed. Please login again.");
      case 403:
        throw new Error("You do not have permission to perform this action.");
      case 404:
        throw new Error("The requested resource was not found.");
      case 422:
        throw new Error(data?.message || "Validation error. Please check your input.");
      case 500:
        throw new Error("Server error. Please try again later.");
      default:
        throw new Error(data?.message || `Error: ${status}`);
    }
  } else if (error.request) {
    throw new Error("Network error. Please check your connection and try again.");
  } else {
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

// ==========================
// API Functions
// ==========================

export async function fetchStudentMarks(filters: FetchMarksFilters): Promise<StudentMark[]> {
  try {
    const requestBody = {
      grade: filters.grade || "",
      class: filters.class || "",
      subject: filters.subject || "",
      term: filters.term || "",
      month: filters.month || "",
      search: filters.searchQuery || "",
    };

    const res = await axios.post(`${API_BASE_URL}/api/add-marks`, requestBody, getAuthHeader());
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    handleApiError(error, "fetchStudentMarks");
    return [];
  }
}

export async function submitStudentMarks(marksToSubmit: Partial<StudentMark>[]): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/api/marks/update`, marksToSubmit, getAuthHeader());
  } catch (error) {
    handleApiError(error, "submitStudentMarks");
  }
}

export async function fetchGradesFromApi(): Promise<DropdownOption[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/grades`, getAuthHeader());
    return Array.isArray(res.data)
      ? res.data.map((item: any) => ({
          label: item.grade ? `Grade ${item.grade}` : item.name || "Unknown Grade",
          value: item.grade || item.id || "",
        }))
      : [];
  } catch (error) {
    handleApiError(error, "fetchGradesFromApi");
    return [];
  }
}

export async function fetchClassesFromApi(grade?: string): Promise<DropdownOption[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/grade-classes`, {
      ...getAuthHeader(),
      params: grade ? { grade } : {},
    });

    return Array.isArray(res.data)
      ? res.data.map((item: any) => ({
          label: item.class || item.name || "Unknown Class",
          value: item.class || item.id || "",
        }))
      : [];
  } catch (error) {
    handleApiError(error, "fetchClassesFromApi");
    return [];
  }
}

// ==========================
// Auth Utilities
// ==========================

export const hasAuthToken = (): boolean => !!localStorage.getItem("authToken");
export const clearAuthToken = (): void => localStorage.removeItem("authToken");
export const setAuthToken = (token: string): void => {
  if (!token || !token.trim()) throw new Error("Invalid token provided");
  localStorage.setItem("authToken", token.trim());
};
export const getAuthToken = (): string | null => localStorage.getItem("authToken");
export const isValidTokenFormat = (token: string | null): boolean => {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
};