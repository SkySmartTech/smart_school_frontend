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
        parentNo: parentData?.parentNo || user.parentNo || '',
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
    address: userData.address,
    birthDay: userData.birthDay,
    contact: userData.contact,
    gender: userData.gender,
    status: userData.status,
    location: userData.location || '',
    userType: userData.userType,
    userRole: getUserRole(userData.userType),
    photo: userData.photo || '',
  };

  let formattedData: any = { ...baseData };

  // Add type-specific fields
  switch (userData.userType) {
    case "Student":
      formattedData = {
        ...formattedData,
        studentGrade: userData.grade || '',
        studentClass: userData.class || '',
        medium: userData.medium || '',
        studentAdmissionNo: userData.studentAdmissionNo || '',
      };
      break;

    case "Teacher":
      formattedData = {
        ...formattedData,
        teacherGrade: userData.grade || '',
        teacherClass: userData.class || '',
        subject: userData.subject || '',
        medium: userData.medium || '',
        staffNo: userData.staffNo || '',
      };
      break;

    case "Parent":
      formattedData = {
        ...formattedData,
        profession: userData.profession || '',
        parentNo: userData.parentNo || '',
        studentAdmissionNo: userData.studentAdmissionNo || '',
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

  console.log('Create payload:', formattedData);

  const response = await axios.post<UserResponse>(
    url,
    formattedData,
    getAuthHeader()
  );
  return response.data.data;
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const url = `${API_BASE_URL}${updateEndpointForUserType(userData.userType, id)}`;
  const currentUser = localStorage.getItem('userName') || 'System';

  // Base data for all user types
  const baseData = {
    name: userData.name || '',
    username: userData.username || '',
    email: userData.email || '',
    address: userData.address || '',
    birthDay: userData.birthDay || '',
    contact: userData.contact || '',
    gender: userData.gender || '',
    status: userData.status,
    userType: userData.userType,
    userRole: getUserRole(userData.userType),
    location: userData.location || '',
    photo: userData.photo || '',
    modifiedBy: currentUser,
  };

  let formattedData: any = { ...baseData };

  // Add type-specific fields
  switch (userData.userType) {
    case "Student":
      formattedData = {
        ...formattedData,
        // Move these fields to root level instead of nesting them
        studentGrade: userData.grade || '',  // Changed from studentData.studentGrade
        studentClass: userData.class || '',  // Changed from studentData.studentClass
        medium: userData.medium || '',       // Changed from studentData.medium
        studentAdmissionNo: userData.studentAdmissionNo || '', // Changed from studentData.studentAdmissionNo
        // You can keep studentData if needed by the backend
        studentData: {
          studentGrade: userData.grade || '',
          studentClass: userData.class || '',
          medium: userData.medium || '',
          studentAdmissionNo: userData.studentAdmissionNo || '',
        }
      };
      break;

    case "Teacher":
      formattedData = {
        ...formattedData,
        teacherData: {
          teacherGrade: userData.grade || '',
          teacherClass: userData.class || '',
          subject: userData.subject || '',
          medium: userData.medium || '',
          staffNo: userData.staffNo || '',
        }
      };
      break;

    case "Parent":
      formattedData = {
        ...formattedData,
        parentData: {
          profession: userData.profession || '',
          parentNo: userData.parentNo || '',
          studentAdmissionNo: userData.studentAdmissionNo || '',
          relation: 'Guardian',
        }
      };
      break;
  }

  // Remove any undefined or null values from the nested data objects
  if (formattedData.teacherData) {
    Object.keys(formattedData.teacherData).forEach(key => {
      if (formattedData.teacherData[key] === undefined || formattedData.teacherData[key] === null || formattedData.teacherData[key] === '') {
        delete formattedData.teacherData[key];
      }
    });
  }

  if (formattedData.studentData) {
    Object.keys(formattedData.studentData).forEach(key => {
      if (formattedData.studentData[key] === undefined || formattedData.studentData[key] === null || formattedData.studentData[key] === '') {
        delete formattedData.studentData[key];
      }
    });
  }

  if (formattedData.parentData) {
    Object.keys(formattedData.parentData).forEach(key => {
      if (formattedData.parentData[key] === undefined || formattedData.parentData[key] === null || formattedData.parentData[key] === '') {
        delete formattedData.parentData[key];
      }
    });
  }

  // Remove any undefined, null, or empty string values from base data
  Object.keys(formattedData).forEach(key => {
    if (formattedData[key] === undefined || formattedData[key] === null || formattedData[key] === '') {
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