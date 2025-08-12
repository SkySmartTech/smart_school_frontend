import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define interfaces for your data
export interface SubjectMark {
  subject: string;
  average_marks: string;
  percentage: number;
}

export interface ClassSubjectMark {
  subject: string;
  average_mark: string;
}

export interface ClassMarks {
  [key: string]: ClassSubjectMark[];
}

export interface ManagementStaffReportData {
  subject_marks: SubjectMark[];
  class_subject_marks: ClassMarks;
  tableData?: {
    class: string;
    english: number;
    arts: number;
    maths: number;
    science: number;
  }[];
}

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

export const fetchManagementStaffReport = async (
  year: string,
  grade: string,
  exam: string
): Promise<ManagementStaffReportData> => {
  try {
    // Validate inputs
    if (!year || !grade || !exam) {
      throw new Error('Missing required parameters: year, grade, or exam');
    }

    const params = {
      year,
      grade,
      exam: exam === "All Terms" ? undefined : exam,
    };

    // Remove undefined parameters
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    console.log('API Request params:', filteredParams); 
    console.log('API URL:', `${API_BASE_URL}/api/management-staff-report`); 

    const response = await axios.get(
      `${API_BASE_URL}/api/management-staff-report`,
      {
        ...getAuthHeader(),
        params: filteredParams,
        timeout: 10000, 
      }
    );

    console.log('API Response:', response.data);

    // Transform the response data
    const transformedData: ManagementStaffReportData = {
      subject_marks: response.data.subject_marks || [],
      class_subject_marks: response.data.class_subject_marks || {},
      tableData: transformToTableData(response.data.class_subject_marks),
    };

    return transformedData;
  } catch (error) {
    console.error('API Error:', error); // Debug log
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        
        throw new Error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to view this data.');
      } else if (error.response?.status === 404) {
        throw new Error('Report endpoint not found. Please contact support.');
    
      } else {
        throw new Error(
          error.response?.data?.message || 
          error.response?.data?.error ||
          `Request failed with status ${error.response?.status}`
        );
      }
    } else if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Network error or unknown error occurred");
  }
};

// Helper function to transform class_subject_marks into tableData format
const transformToTableData = (classSubjectMarks: ClassMarks | undefined) => {
  if (!classSubjectMarks) return [];

  return Object.keys(classSubjectMarks).map((className) => {
    const marks = classSubjectMarks[className];
    const row: any = { class: className };

    marks.forEach((mark) => {
      const subjectKey = mark.subject.toLowerCase();
      row[subjectKey] = parseFloat(mark.average_mark) || 0;
    });

    // Ensure all subjects have default values
    ['english', 'arts', 'maths', 'science'].forEach(subject => {
      if (!row[subject]) row[subject] = 0;
    });

    return row;
  });
};

// Optional: Add a function to check if user is authenticated
export const checkAuthStatus = (): boolean => {
  const token = localStorage.getItem('authToken') || 
                localStorage.getItem('token') || 
                localStorage.getItem('access_token');
  return !!token;
};

// Optional: Add a function to refresh token if your API supports it
export const refreshAuthToken = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token: refreshToken
    });

    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    throw new Error('Session refresh failed. Please login again.');
  }
};