// src/types/userTypes.ts
export type TeacherData = {
  id?: number;
  teacherGrade?: string;
  teacherClass?: string;
  subject?: string;
  medium?: string;
  staffNo?: string;
  userId?: string | number;
  userType?: string | null;
  modifiedBy?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type StudentInfoNested = {
  id: number;
  studentGrade: string | null;
  studentClass: string | null;
  medium: string | null;
  studentAdmissionNo: string | null;
  year?: string | null;
  userType?: string | null;
  userId?: string | null;
  modifiedBy?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user?: any;
};

export type ParentInfo = {
  id?: number;
  studentAdmissionNo?: string;
  profession?: string;
  parentContact?: string;
  relation?: string;
  student?: any; // or a specific Student sub-type
  userId?: string | number | null;
  userType?: string | null;
  modifiedBy?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ParentData = {
  parent_info?: ParentInfo | null;
  student_info?: { name?: string | null; grade?: string | null; class?: string | null } | null;
};

export type StudentData = {
  id?: number;
  studentGrade?: string;
  studentClass?: string | null;
  medium?: string | null;
  studentAdmissionNo?: string;
  year?: string;
  modifiedBy?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export interface User {
  id: number;
  name: string;
  address: string;
  birthDay: string;
  userType: string;
  gender: string;
  userRole: string;
  username: string;
  password: string;
  email: string;
  location: string;
  grade: string;
  contact: string;
  photo: string;
  subject: string;
  class: string;
  epf?: string;
  // new optional profile details:
  teacher_data?: TeacherData[] | null;
  parent_data?: ParentData | null;
  student_data?: StudentData | null;
}

export interface PhotoUploadResponse {
  photoUrl: string;
}