export interface User {
  id?: number;
  epf: string;
  employeeName: string;
  username: string;
  department: string;
  contact: string;
  email: string;
  userType: "TEACHER" | "STUDENT" | "PARENT" | "Admin" | "User" | "Manager";
  availability: boolean;
  password: string;
  status?: boolean;
  // Additional fields for different user types
  address?: string;
  birthday?: string;
  gender?: string;
  grade?: string;
  class?: string;
  subject?: string;
  medium?: string;
}

export const departments = ["IT", "HR", "Finance", "Marketing", "Operations"] as const;
export const userTypes = ["TEACHER", "STUDENT", "PARENT", "Admin", "User", "Manager"] as const;

export const availabilityOptions = [
  { value: true, label: "Available" },
  { value: false, label: "Not Available" }
] as const;

export const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" }
] as const;

// Additional types for API responses
export type UserListResponse = {
  data: User[];
  success: boolean;
  message?: string;
};

export type UserResponse = {
  data: User;
  success: boolean;
  message?: string;
};