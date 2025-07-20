import axios from "axios";
import { z } from "zod";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// User Schema with all 15 fields
export const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  birthday: z.string().min(1, "Birthday is required"),
  phone: z.string().min(1, "Phone is required"),
  medium: z.string().min(1, "Medium is required"),
  gender: z.string().min(1, "Gender is required"),
  idNumber: z.string().min(1, "ID number is required"),
  role: z.string().min(1, "Role is required"),
  parent: z.string().optional(),
  profession: z.string().optional(),
  image: z.instanceof(File).optional(),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type User = z.infer<typeof userSchema>;

// Register User with all fields
export async function registerUser(userData: FormData) {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw new Error("Registration failed");
  }
}

// Login User
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

// Get User Profile
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

// Update User Profile
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

// Validate User Token
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