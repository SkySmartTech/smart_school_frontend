import axios from "axios";
import { z } from "zod";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const userSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  birthday: z.string().min(1, "Birthday is required"),
  contact: z.string().min(1, "Phone is required"),
  userType: z.string().min(1, "Role is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  password_confirmation: z.string().min(1, "Please confirm your password"),
  image: z.instanceof(File).optional(),
  // Teacher specific fields
  grade: z.string().optional(),
  subject: z.string().optional(),
  class: z.string().optional(),
  staffId: z.string().optional(),
  // Student specific fields
  student_admission_no: z.string().optional(),
  // Parent specific fields
  profession: z.string().optional(),
  parentContact: z.string().optional(),
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export type User = z.infer<typeof userSchema>;

export async function registerUser(userData: FormData) {
  try {
    const response = await API.post("/api/user-register", userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw new Error("Registration failed");
  }
}

export async function loginUser(credentials: { username: string; password: string }) {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw new Error("Login failed");
  }
}

export async function getUserProfile(userId: string) {
  try {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch profile");
    }
    throw new Error("Failed to fetch profile");
  }
}

export async function updateUserProfile(userId: string, userData: Partial<User>) {
  try {
    const response = await API.patch(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Update failed");
    }
    throw new Error("Update failed");
  }
}

export async function validateUser() {
  try {
    const response = await API.get("/auth/validate");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Validation failed");
    }
    throw new Error("Validation failed");
  }
}

export const authService = {
  register: registerUser,
  login: loginUser,
  validate: validateUser,
  getProfile: getUserProfile,
  updateProfile: updateUserProfile,
};