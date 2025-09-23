export interface BaseUser {
  id?: number;
  name: string;
  username: string;
  email: string;
  userType: "Student" | "Teacher" | "Parent";
  status: boolean;
  userRole?: "user" | "admin";
  password?: string;
  address?: string;
  birthDay?: string;
  contact?: string;
  gender?: string;
  photo?: string;
  location?: string;
}

export interface StudentData {
  id?: number;
  studentGrade: string;
  studentClass: string;
  medium: string;
  studentAdmissionNo?: string;
  teacherGrades?: string[];

}

export interface TeacherData {
  id?: number;
  teacherGrade: string;
  teacherClass: string[];
    subject?: string[]; 
  medium: string[];
  staffNo?: string;
  teacherGrades?: string[];
}

export interface ParentData {
  id?: number;
  profession: string;
  parentNo: string;
  studentAdmissionNo: string;
  location?: string;
    relation?: string;
  teacherGrades?: string[];
}

export interface User extends BaseUser {
  location: string;
  // API nested objects
  student?: StudentData;
  teacher?: TeacherData | TeacherData[];
  parent?: ParentData;
    subjects?: string[];
  relation?: string;

  // Flattened fields
  grade?: string;
  studentGrade?: string;
  teacherGrade?: string;
  teacherGrades?: string[];
  studentAdmissionNo?: string;
  class?: string | string[];
  medium?: string | string[];
  subject?: string;
  profession?: string;
  parentNo?: string;
  staffNo?: string;
  photo?: string;

  // Additional fields for form handling
  studentClass?: string;
  teacherClass?: string[];
}

export interface UserListResponse {
  users: any;
  data: User[];
}

export interface UserResponse {
  data: User;
}

export const statusOptions = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' }
];

// Add missing option arrays
export const genderOptions: string[] = [
  'Male',
  'Female',
  'Other'
];

export const gradeOptions: string[] = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Grade 13'
];

export const classOptions: string[] = [
  "Araliya", "Olu", "Nelum", "Rosa", "Manel", "Sooriya", "Kumudu"
];

export const mediumOptions: string[] = [
  'Sinhala',
  'English',
  'Tamil'
];

export const subjectOptions: string[] = [
  'Mathematics',
  'Science',
  'English',
  'Sinhala',
  'History',
  'Geography',
  'Commerce',
  'ICT',
  'Art',
  'Music',
  'Dancing',
  'Physical Education',
  'Buddhism',
  'Christianity',
  'Islam',
  'Hinduism'
];