export interface User {
  id?: number;
  name: string;
  username: string;
  email: string;
  address?: string;
  birthday?: string;
  phoneNo?: string;
  gender?: string;
  userType: "TEACHER" | "STUDENT" | "PARENT";
  status: boolean;
  password?: string;
  
  // Student specific fields
  grade?: string;
  medium?: string;
  
  // Teacher specific fields
  class?: string;
  subject?: string;
  
  // Parent specific fields
  profession?: string;
  parentNo?: string;
}

export const genderOptions = ["Male", "Female", "Other"] as const;
export const gradeOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
export const mediumOptions = ["Sinhala", "English", "Tamil"] as const;
export const classOptions = ["A", "B", "C", "D", "E"] as const;
export const subjectOptions = [
  "Mathematics", "Science", "Sinhala", "English", "History", 
  "Geography", "ICT", "Art", "Music", "Drama", "Dance"
] as const;

export const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" }
] as const;

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