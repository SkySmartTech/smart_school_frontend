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
    birthDay: z.string().min(1, "Birthday is required"),
    contact: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be at most 15 digits"),
    userType: z.string().min(1, "Role is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),

    photo: z.instanceof(File).optional(),

    gender: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    userRole: z.string().min(1, "User role is required"),

    // Teacher specific fields
    grade: z.string().min(1, "Grade is required"),
    subject: z.string().min(1, "Subject is required"),
    class: z.string().min(1, "Class is required"),
    staffId: z.string().min(1, "Staff ID is required"),
    teacherStaffId: z.string().min(1, "Teacher Staff ID is required"),
    teacherGrades: z.array(z.string().min(1)).nonempty("At least one grade is required"),
    teacherClass: z.array(z.string().min(1)).nonempty("At least one class is required"),
    subjects: z.array(z.string().min(1)).nonempty("At least one subject is required"),
    staffNo: z.string().min(1, "Staff number is required"),
    medium: z.array(z.string().min(1)).nonempty("At least one medium is required"),

    // Student specific fields
    studentGrade: z.string().min(1, "Student grade is required"),
    studentClass: z.string().min(1, "Student class is required"),
    studentAdmissionNo: z.string().min(1, "Admission number is required"),
    parentNo: z
      .string()
      .min(10, "Parent phone must be at least 10 digits")
      .max(15, "Parent phone must be at most 15 digits"),
    parentProfession: z.string().min(1, "Parent profession is required"),

    // Parent specific fields
    profession: z.string().min(1, "Profession is required"),
    relation: z.string().min(1, "Relation is required"),
  
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

// Role-specific registration functions
export async function registerStudent(studentData: FormData) {
  try {
    // Try reading a JSON string payload first (preferred)
    const raw = studentData.get('studentData');
    let studentArr: any[] = [];

    if (raw) {
      studentArr = JSON.parse(raw as string);
    } else {
      // fallback: convert individual fields into a single-item array
      studentArr = [
        {
          studentGrade: studentData.get('studentGrade'),
          medium: studentData.get('medium'),
          studentClass: studentData.get('studentClass'),
          studentAdmissionNo: studentData.get('studentAdmissionNo'),
          userId: studentData.get('userId'),
          userType: studentData.get('userType'),
        },
      ];
    }

    const requestBody = {
      studentData: studentArr.map((item: any) => ({
        studentGrade: item.studentGrade,
        studentClass: item.studentClass,
        medium: item.medium,
        studentAdmissionNo: item.studentAdmissionNo,
        userId: studentData.get('userId'),
        userType: studentData.get('userType'),
      })),
    };

    const response = await API.post("/api/user-student-register", requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Student registration failed");
    }
    throw new Error("Student registration failed");
  }
}

export async function registerTeacher(teacherData: FormData) {
  try {
    // Convert FormData to an array of teacher assignments
    const teacherAssignments = JSON.parse(teacherData.get('teacherAssignments') as string);
    const staffNo = teacherData.get('staffNo'); // Get staffNo from FormData

    if (!staffNo) {
      throw new Error("Staff number is required");
    }

    // Create the request body in the expected format
    const requestBody = {
      teacherData: teacherAssignments.map((assignment: any) => ({
        teacherGrade: assignment.teacherGrade,
        teacherClass: assignment.teacherClass,
        subject: assignment.subject,
        medium: assignment.medium,
        staffNo: staffNo, // Use the staffNo from FormData
        userId: teacherData.get('userId'),
        userType: teacherData.get('userType')
      }))
    };

    const response = await API.post("/api/user-teacher-register", requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Teacher registration failed");
    }
    throw new Error("Teacher registration failed");
  }
}

export async function registerParent(parentData: FormData) {
  try {
    const raw = parentData.get('parentData');
    let parentArr: any[] = [];

    if (raw) {
      parentArr = JSON.parse(raw as string);
    } else {
      parentArr = [
        {
          studentAdmissionNo: parentData.get('studentAdmissionNo'),
          profession: parentData.get('profession'),
          relation: parentData.get('relation'),
          parentNo: parentData.get('parentNo'),
          userId: parentData.get('userId'),
          userType: parentData.get('userType'),
        }
      ];
    }

    const requestBody = {
      parentData: parentArr.map((item: any) => ({
        studentAdmissionNo: item.studentAdmissionNo,
        profession: item.profession,
        relation: item.relation,
        parentNo: item.parentNo ?? null,
        userId: parentData.get('userId'),
        userType: parentData.get('userType'),
      }))
    };

    const response = await API.post("/api/user-parent-register", requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Parent registration failed");
    }
    throw new Error("Parent registration failed");
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