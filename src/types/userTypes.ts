// src/types/userTypes.ts
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
}

export interface PhotoUploadResponse {
  photoUrl: string;
}