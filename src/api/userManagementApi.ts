import axios from "axios";
import type { User, UserListResponse, UserResponse } from "../types/userManagementTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type UserType = "Student" | "Teacher" | "Parent";

const getAuthHeader = () => {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  if (!token) {
    console.error("No authentication token found in localStorage");
    throw new Error("Authentication token not found. Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
};

export const getUserRole = (_userType: UserType): "user" | "admin" => {
  return "user";
};

const endpointForUserType = (userType: UserType) => {
  switch (userType) {
    case "Student":
      return "/api/all-students";
    case "Parent":
      return "/api/all-parents";
    case "Teacher":
    default:
      return "/api/all-teachers";
  }
};

const createEndpointForUserType = (userType: UserType) => {
  switch (userType) {
    case "Student":
      return "/api/add-new-student";
    case "Parent":
      return "/api/add-new-parent";
    case "Teacher":
    default:
      return "/api/add-new-teacher";
  }
};

const updateEndpointForUserType = (userType: UserType, id: number) => {
  switch (userType) {
    case "Student":
      return `/api/user-student/${id}/update`;
    case "Parent":
      return `/api/user-parent/${id}/update`;
    case "Teacher":
    default:
      return `/api/user-teacher/${id}/update`;
  }
};

const deactivateEndpointForUserType = (userType: UserType, id: number) => {
  switch (userType) {
    case "Student":
      return `/api/user-student/${id}/status-update`;
    case "Parent":
      return `/api/user-parent/${id}/status-update`;
    case "Teacher":
    default:
      return `/api/user-teacher/${id}/status-update`;
  }
};

export const fetchUsers = async (userType: UserType = "Teacher"): Promise<User[]> => {
  try {
    const url = `${API_BASE_URL}${endpointForUserType(userType)}`;
    
    const response = await axios.get<UserListResponse>(url, {
      ...getAuthHeader(),
      withCredentials: true,
      // Add timeout and cache control headers
      timeout: 15000,
      headers: {
        ...getAuthHeader().headers,
        'Cache-Control': 'max-age=300' // Allow caching for 5 minutes
      }
    });

    // Use early returns for error cases
    if (!response?.data) return [];
    
    const userData = Array.isArray(response.data) ? response.data : 
                    response.data.data || response.data.users || [];
    
    if (!Array.isArray(userData)) return [];

    // Use Map for better performance with large datasets
    return userData.map(user => ({
      id: user.id,
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      status: user.status ?? true,
      userType,
      address: user.address || '',
      birthDay: user.birthDay || '',
      contact: user.contact || '',
      gender: user.gender || '',
      location: user.location || '',
      photo: user.photo || '',
      grade: '',
      class: '',
      medium: '',
      studentAdmissionNo: '',
      subject: '',
      staffNo: '',
      profession: '',
      parentContact: '',
      ...getTypeSpecificFields(user, userType)
    }));
  } catch (error) {
    console.error(`Error in fetchUsers(${userType}):`, error);
    throw error;
  }
};

// Separate function for type-specific fields
const getTypeSpecificFields = (user: any, userType: UserType) => {
  switch (userType) {
    case "Student":
      return {
        grade: user.student?.studentGrade || user.studentGrade || '',
        class: user.student?.studentClass || user.studentClass || '',
        medium: user.student?.medium || user.medium || '',
        studentAdmissionNo: user.student?.studentAdmissionNo || user.studentAdmissionNo || '',
      };
    case "Teacher":
      const teacherData = Array.isArray(user.teacher) ? user.teacher[0] : user.teacher || user;
      return {
        grade: teacherData?.teacherGrade || teacherData?.grade || '',
        class: Array.isArray(teacherData?.teacherClass) ? teacherData.teacherClass.join(', ') : teacherData?.teacherClass || '',
        subject: Array.isArray(teacherData?.subject) ? teacherData.subject.join(', ') : teacherData?.subject || '',
        medium: Array.isArray(teacherData?.medium) ? teacherData.medium.join(', ') : teacherData?.medium || '',
        staffNo: teacherData?.staffNo || '',
      };
    case "Parent":
      const parentData = user.parent || user;
      return {
        profession: parentData?.profession || user.profession || '',
        parentContact: parentData?.parentContact || user.parentContact || '',
        studentAdmissionNo: parentData?.studentAdmissionNo || user.studentAdmissionNo || '',
      };
    default:
      return {};
  }
};

export const createUser = async (userData: User): Promise<User> => {
  const url = `${API_BASE_URL}${createEndpointForUserType(userData.userType)}`;
  
  // Base data for all user types
  const baseData = {
    name: userData.name,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    address: userData.address || '',
    birthDay: userData.birthDay || '',
    contact: userData.contact || '',
    gender: userData.gender || '',
    status: userData.status,
    location: userData.location || '',
    userType: userData.userType,
    userRole: getUserRole(userData.userType),
    photo: userData.photo || null, // Always include photo field, even if null
  };

  let formattedData: any = { ...baseData };

  // Add type-specific fields
  switch (userData.userType) {
    case "Student":
      formattedData.studentData = {
        studentGrade: userData.grade || '',
        studentClass: userData.class || '',
        medium: userData.medium || '',
        studentAdmissionNo: userData.studentAdmissionNo || '',
      };
      break;

    case "Teacher":
      // Format the teacherData array
      const teacherAssignments = userData.teacherAssignments?.map(assignment => ({
        teacherGrade: assignment.teacherGrade || '',
        teacherClass: assignment.teacherClass || '',
        subject: assignment.subject || '',
        medium: assignment.medium || '',
        staffNo: userData.staffNo || '',
        modifiedBy: localStorage.getItem('userName') || 'System'
      })) || [];

      if (teacherAssignments.length === 0) {
        // If no assignments, create one from the form data
        teacherAssignments.push({
          teacherGrade: userData.grade || '',
          teacherClass: userData.class || '',
          subject: userData.subject || '',
          medium: userData.medium || '',
          staffNo: userData.staffNo || '',
          modifiedBy: localStorage.getItem('userName') || 'System'
        });
      }

      formattedData.teacherData = teacherAssignments;
      break;

    case "Parent":
      formattedData.parentData = {
        studentAdmissionNo: userData.studentAdmissionNo || '',
        parentContact: userData.contact || userData.parentContact || '', // Use contact or parentContact
        profession: userData.profession || '',
        relation: 'Guardian', // Always include relation
      };
      
      // Also include these fields at the root level for the User model
      formattedData = {
        ...formattedData,
        studentAdmissionNo: userData.studentAdmissionNo || '',
        parentContact: userData.contact || userData.parentContact || '',
        profession: userData.profession || '',
        relation: 'Guardian',
      };
      break;
  }

  // Remove any undefined or null values
  Object.keys(formattedData).forEach(key => {
    if (formattedData[key] === undefined || formattedData[key] === null) {
      delete formattedData[key];
    }
  });

  // Also clean up nested objects
  if (formattedData.teacherData) {
    Object.keys(formattedData.teacherData).forEach(key => {
      if (formattedData.teacherData[key] === undefined || 
          formattedData.teacherData[key] === null || 
          formattedData.teacherData[key] === '') {
        delete formattedData.teacherData[key];
      }
    });
  }

  console.log('Create payload:', formattedData);

  try {
    const response = await axios.post<UserResponse>(
      url,
      formattedData,
      {
        ...getAuthHeader(),
        withCredentials: true
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Create error:', error.response?.data);
    if (error.response?.data?.errors) {
      throw new Error(Object.values(error.response.data.errors).flat().join(', '));
    }
    throw error;
  }
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const url = `${API_BASE_URL}${updateEndpointForUserType(userData.userType, id)}`;
  const currentUser = localStorage.getItem('userName') || 'System';

  // Base data for all user types - only include non-empty values
  const baseData: Record<string, any> = {
    userType: userData.userType,
    userRole: getUserRole(userData.userType),
    modifiedBy: currentUser,
    photo: userData.photo || null, // Always include photo, even if null
  };

  // Helper function to safely handle string or string array
  const safeString = (value: string | string[] | undefined): string | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      const joined = value.join(', ').trim();
      return joined || undefined;
    }
    const trimmed = String(value).trim();
    return trimmed || undefined;
  };

  // Handle required and optional fields
  const fields = {
    name: safeString(userData.name),
    username: safeString(userData.username),
    email: safeString(userData.email),
    address: safeString(userData.address),
    birthDay: safeString(userData.birthDay),
    contact: safeString(userData.contact),
    gender: safeString(userData.gender),
    location: safeString(userData.location)
  };

  // Add non-empty fields to baseData
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      baseData[key] = value;
    }
  });

  // Handle status separately since it's a boolean
  if (userData.status !== undefined) {
    baseData.status = userData.status;
  }

  let formattedData: Record<string, any> = { ...baseData };

  switch (userData.userType) {
    case "Teacher":
      const teacherData: Record<string, any> = {
        teacherGrade: safeString(userData.grade),
        teacherClass: safeString(userData.class),
        subject: safeString(userData.subject),
        medium: safeString(userData.medium),
        staffNo: safeString(userData.staffNo),
        modifiedBy: currentUser
      };

      // Remove empty values
      Object.keys(teacherData).forEach(key => {
        if (typeof teacherData[key as keyof typeof teacherData] === 'undefined' || 
            teacherData[key as keyof typeof teacherData] === null) {
          delete teacherData[key as keyof typeof teacherData];
        }
      });

      if (Object.keys(teacherData).length > 0) {
        formattedData.teacherData = teacherData;
      }
      break;

    case "Parent":
      // Create parentData object with all required fields
      const parentData: Record<string, any> = {
        userType: userData.userType,
        studentAdmissionNo: userData.studentAdmissionNo || '',
        parentContact: userData.contact || userData.parentContact || '',
        profession: userData.profession || '',
        relation: 'Guardian',
        modifiedBy: currentUser
      };

      // Clean up undefined or null values
      Object.keys(parentData).forEach(key => {
        if (!parentData[key]) {
          delete parentData[key];
        }
      });

      // Include both in parentData and root level to match backend expectations
      formattedData = {
        ...formattedData,
        ...parentData,
        parentData: parentData
      };
      break;

    case "Student":
      const studentData: Record<string, any> = {};
      
      const studentGrade = safeString(userData.grade);
      const studentClass = safeString(userData.class);
      const studentMedium = safeString(userData.medium);
      const admissionNo = safeString(userData.studentAdmissionNo);

      if (studentGrade) {
        studentData.studentGrade = studentGrade;
        formattedData.studentGrade = studentGrade;
      }
      if (studentClass) {
        studentData.studentClass = studentClass;
        formattedData.studentClass = studentClass;
      }
      if (studentMedium) {
        studentData.medium = studentMedium;
        formattedData.medium = studentMedium;
      }
      if (admissionNo) {
        studentData.studentAdmissionNo = admissionNo;
        formattedData.studentAdmissionNo = admissionNo;
      }

      if (Object.keys(studentData).length > 0) {
        formattedData.studentData = studentData;
      }
      break;
  }

  // Final cleanup - remove any remaining empty values
  Object.keys(formattedData).forEach(key => {
    if (
      formattedData[key] === undefined || 
      formattedData[key] === null || 
      formattedData[key] === '' ||
      (Array.isArray(formattedData[key]) && formattedData[key].length === 0)
    ) {
      delete formattedData[key];
    }
  });

  console.log('Update payload:', formattedData);

  try {
    const response = await axios.post<UserResponse>(
      url,
      formattedData,
      {
        ...getAuthHeader(),
        withCredentials: true
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Update error:', error.response?.data);
    if (error.response?.data?.errors) {
      throw new Error(Object.values(error.response.data.errors).flat().join(', '));
    }
    throw error;
  }
};

export const deactivateUser = async (id: number, userType: UserType): Promise<void> => {
  const url = `${API_BASE_URL}${deactivateEndpointForUserType(userType, id)}`;
  await axios.post(
    url,
    { status: false },
    getAuthHeader()
  );
};

export const searchUsers = async (searchTerm: string, userType?: string): Promise<User[]> => {
  const response = await axios.get<UserListResponse>(
    `${API_BASE_URL}/api/users/search`,
    {
      ...getAuthHeader(),
      params: {
        keyword: searchTerm,
        userType,
      },
    }
  );
  return response.data.data;
};

export const bulkDeactivateUsers = async (ids: number[], userType: UserType): Promise<void> => {
  const promises = ids.map(id => deactivateUser(id, userType));
  await Promise.all(promises);
};