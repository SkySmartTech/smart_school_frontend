import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Teacher {
  id: string;
  staffNo: string;
  name: string;
  email?: string;
  grade?: string;
  class?: string;
}

export interface ClassTeacher {
  id?: number;
  grade: string;
  className: string;
  teacherId?: string;
  teacherName?: string;
  staffNo?: string;
}

export interface ClassTeacherAssignment {
  grade: string;
  class: string;
  teacherId: string;
  staffNo: string;
  teacherName: string;
}

export interface SearchTeachersParams {
  search?: string;
  grade?: string;
}

// Raw API response shape for /api/class-teachers
interface ApiClassTeacher {
  teacherClass: any;
  teacherGrade: any;
  name: string;
  id: number;
  grade: string;
  class: string;
  classTeacher?: string;
  created_at?: string;
  updated_at?: string;
}

// Teacher-by-grade-and-class raw shapes
interface ApiTeacherUser {
  id: number | string;
  name?: string;
  teacher?: Array<{
    id?: number | string;
    teacherGrade?: string;
    teacherClass?: string;
    staffNo?: string;
    userId?: string | number;
    subject?: string;
    medium?: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

// Auth header function
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');

  if (!token) {
    console.error('No authentication token found in localStorage');
    throw new Error('Authentication token not found. Please login again.');
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

// Fetch all teachers with search and filter capabilities
export async function fetchTeachers(params?: SearchTeachersParams): Promise<Teacher[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.grade) queryParams.append('grade', params.grade);

    const url = `${API_BASE_URL}/api/teachers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const res = await axios.get(url, getAuthHeader());
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    handleApiError(error, "fetchTeachers");
    return [];
  }
}

// Fetch teachers for a specific grade and class
export async function fetchTeachersByGradeAndClass(grade: string, className: string): Promise<Teacher[]> {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/teachers/${encodeURIComponent(grade)}/${encodeURIComponent(className)}`,
      getAuthHeader()
    );

    const raw = Array.isArray(res.data) ? res.data as ApiTeacherUser[] : [];

    const mapped: Teacher[] = raw.flatMap(user => {
      if (!Array.isArray(user.teacher) || user.teacher.length === 0) {
        return [{
          id: String(user.id ?? ""),
          staffNo: "",
          name: user.name ?? "",
          grade: "",
          class: ""
        }];
      }

      return user.teacher.map(t => ({
        // prefer inner teacher id if present, fall back to userId or parent user id
        id: String(t.id ?? t.userId ?? user.id ?? ""),
        staffNo: t.staffNo ?? "",
        name: user.name ?? "",
        grade: t.teacherGrade ?? "",
        class: t.teacherClass ?? ""
      }));
    });

    return mapped;
  } catch (error) {
    handleApiError(error, "fetchTeachersByGradeAndClass");
    return [];
  }
}

// Fetch class teachers for a specific grade
export async function fetchClassTeachersByGrade(grade: string): Promise<ClassTeacher[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/class-teachers/grade/${encodeURIComponent(grade)}`, getAuthHeader());
    const raw = Array.isArray(res.data) ? res.data as ApiClassTeacher[] : [];
    return raw.map(item => ({
      id: item.id,
      grade: item.teacherGrade,
      className: item.teacherClass,
      teacherName: item.name || "Not assigned"
    }));
  } catch (error) {
    handleApiError(error, "fetchClassTeachersByGrade");
    return [];
  }
}

// Assign/update class teacher (your backend uses this endpoint)
export async function assignClassTeacher(assignment: ClassTeacherAssignment): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/class-teacher-create`, 
      assignment, 
      getAuthHeader()
    );
    return {
      success: true,
      message: response.data?.message || "Class teacher assigned successfully"
    };
  } catch (error) {
    handleApiError(error, "assignClassTeacher");
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to assign class teacher"
    };
  }
}

// Delete a class teacher assignment by its assignment id
export async function deleteClassTeacher(assignmentId: number | string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/class-teacher/${encodeURIComponent(String(assignmentId))}/delete`,
      getAuthHeader()
    );
    return {
      success: true,
      message: response.data?.message || "Class teacher assignment deleted successfully"
    };
  } catch (error) {
    try {
      // handleApiError will throw; catch and convert to returned message instead
      handleApiError(error, "deleteClassTeacher");
      return { success: false, message: "Failed to delete class teacher" };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to delete class teacher" };
    }
  }
}

// Get all class teacher assignments
export async function getAllClassTeachers(): Promise<ClassTeacher[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/class-teachers`, getAuthHeader());
    const raw = Array.isArray(res.data) ? res.data as ApiClassTeacher[] : [];
    return raw.map(item => ({
      id: item.id,
      grade: item.teacherGrade,
      className: item.teacherClass,
      teacherName: item.name || "Not assigned"
    }));
  } catch (error) {
    handleApiError(error, "getAllClassTeachers");
    return [];
  }
}

const handleApiError = (error: any, _operation: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      throw new Error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      throw new Error('The requested resource was not found.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Request failed with status ${error.response?.status}`
      );
    }
  } else if (error.request) {
    throw new Error("Network error. Please check your connection and try again.");
  } else {
    throw new Error(error.message || "An unexpected error occurred. Please try again.");
  }
};