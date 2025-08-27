import {
  Box,
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
  // Avatar,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import {
  AccountCircle,
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  Email,
  Phone,
  Work,
  Home,
  Cake,
  // CloudUpload,
  AssignmentInd,
  School,
  Class,
  Subject,
  Numbers,
  Add,
  Delete,
  Language
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser, registerStudent, registerTeacher, registerParent } from "../../api/userApi";
import type { User } from "../../api/userApi";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// import { styled } from '@mui/material/styles';

// const VisuallyHiddenInput = styled('input')({
//   clip: 'rect(0 0 0 0)',
//   clipPath: 'inset(50%)',
//   height: 1,
//   overflow: 'hidden',
//   position: 'absolute',
//   bottom: 0,
//   left: 0,
//   whiteSpace: 'nowrap',
//   width: 1,
// });

const gender = ["Male", "Female"];
const roles = ["Teacher", "Student", "Parent"];
const professions = ["Engineer", "Doctor", "Teacher", "Designer", "Other"];
const relations = ["Father", "Mother", "Other"];
const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const subjects = ["Math", "Science", "English", "History", "Geography", "Art", "Music", "Physical Education", "Computer Science"];
const classes = ["Araliya", "Olu", "Nelum", "Rosa", "Manel", "Sooriya", "Kumudu"];
const mediumOptions = ["Sinhala", "English", "Tamil"];

interface FormData extends Omit<User, 'photo'> {
  photo: FileList | null;
  password_confirmation: string;
  grade?: string;
  studentGrade?: string;
  subject?: string;
  class?: string;
  location?: string;
  profession?: string;
  parentContact?: string;
  gender?: string;
  staffId?: string;
  teacherStaffId?: string;
  studentAdmissionNo?: string;
  teacherGrades: string[];
  teacherClass: string[];
  subjects: string[];
  staffNo?: string;
  medium: string[];
}

interface RegisterFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

type TeacherAssignment = {
  grades: string[];
  subjects: string[];
  classes: string[];
  medium: string[];
  id: string; // for grid row identification
};

const steps = ['Basic Information', 'Role Details'];

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  // const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [registeredUser, setRegisteredUser] = useState<{ userId: number; userType: string } | null>(null);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  // const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      teacherGrades: [],
      teacherClass: [],
      subjects: [],
      medium: []
    }
  });

  const password = watch("password");
  const userType = watch("userType");

  useEffect(() => {
    setSelectedRole(userType);
  }, [userType]);

  // Step 1: Register basic user data
  const { mutate: registerBasicUser, isPending: isRegisteringBasic } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setRegisteredUser({ userId: data.userId, userType: data.userType });
      setActiveStep(1);
    },
    onError: (error: any) => {
      onError(error.message || "Basic registration failed");
    },
  });

  // Step 2: Register role-specific data
  const { mutate: registerStudentData, isPending: isRegisteringStudent } = useMutation({
    mutationFn: registerStudent,
    onSuccess: () => {
      onSuccess();
      navigate("/login");
    },
    onError: (error: any) => {
      onError(error.message || "Student registration failed");
    },
  });

  const { mutate: registerTeacherData, isPending: isRegisteringTeacher } = useMutation({
    mutationFn: registerTeacher,
    onSuccess: () => {
      onSuccess();
      navigate("/login");
    },
    onError: (error: any) => {
      onError(error.message || "Teacher registration failed");
    },
  });

  const { mutate: registerParentData, isPending: isRegisteringParent } = useMutation({
    mutationFn: registerParent,
    onSuccess: () => {
      onSuccess();
      navigate("/login");
    },
    onError: (error: any) => {
      onError(error.message || "Parent registration failed");
    },
  });

  const handleNext = async () => {
    let isValid = false;

    if (activeStep === 0) {
      isValid = await trigger([
        "name",
        "address",
        "email",
        "birthDay",
        "contact",
        "userType",
        "username",
        "password",
        "password_confirmation",
        "photo"
      ]);
    } else if (activeStep === 1) {
      if (selectedRole === "Teacher") {
        isValid = await trigger(["teacherGrades", "subjects", "teacherClass", "staffNo", "medium"]);
      } else if (selectedRole === "Student") {
        isValid = await trigger(["studentGrade", "studentAdmissionNo"]);
      } else if (selectedRole === "Parent") {
        isValid = await trigger(["profession", "parentContact"]);
      }
    }

    if (!isValid) return;

    if (activeStep === 0) {
      const formData = new FormData();
      const formValues = watch();

      // Handle non-array fields
      Object.entries(formValues)
        .filter(([key]) => !['teacherGrades', 'teacherClass', 'subjects', 'medium'].includes(key))
        .forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'photo' && value instanceof FileList && value.length > 0) {
              formData.append(key, value[0]);
            } else if (typeof value === 'string' || value instanceof Blob) {
              formData.append(key, value);
            }
          }
        });

      // Handle array fields
      const arrayFields = ['teacherGrades', 'teacherClass', 'subjects', 'medium'];
      arrayFields.forEach(field => {
        const fieldValue = formValues[field as keyof FormData];
        if (fieldValue && Array.isArray(fieldValue)) {
          fieldValue.forEach(item => {
            formData.append(`${field}[]`, item);
          });
        }
      });

      // Add userRole field
      formData.append('userRole', 'user');

      registerBasicUser(formData);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = (data: FormData) => {
    if (!registeredUser) return;

    const formData = new FormData();

    // Add userId and userType from the first registration
    formData.append('userId', registeredUser.userId.toString());
    formData.append('userType', registeredUser.userType);

    // Handle non-array fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['teacherGrades', 'teacherClass', 'subjects', 'medium'].includes(key)) {
        if (key === 'photo' && value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        } else if (typeof value === 'string' || value instanceof Blob) {
          formData.append(key, value);
        }
      }
    });

    // Handle array fields
    const arrayFields = ['teacherGrades', 'teacherClass', 'subjects', 'medium'];
    arrayFields.forEach(field => {
      const fieldValue = data[field as keyof FormData];
      if (fieldValue && Array.isArray(fieldValue)) {
        fieldValue.forEach(item => {
          formData.append(`${field}[]`, item);
        });
      }
    });

    // Submit to appropriate endpoint based on userType
    if (registeredUser.userType === "Student") {
      registerStudentData(formData);
    } else if (registeredUser.userType === "Teacher") {
      registerTeacherData(formData);
    } else if (registeredUser.userType === "Parent") {
      registerParentData(formData);
    }
  };

  // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files.length > 0) {
  //     const file = event.target.files[0];
  //     setValue("photo", event.target.files);
  //     setPreviewImage(URL.createObjectURL(file));
  //   }
  // };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleAddAssignment = () => {
    const currentGrades = watch("teacherGrades") || [];
    const currentSubjects = watch("subjects") || [];
    const currentClasses = watch("teacherClass") || [];
    const currentMedium = watch("medium") || [];

    if (currentGrades.length && currentSubjects.length && currentClasses.length && currentMedium.length) {
      const newAssignment: TeacherAssignment = {
        grades: currentGrades,
        subjects: currentSubjects,
        classes: currentClasses,
        medium: currentMedium,
        id: crypto.randomUUID()
      };

      setTeacherAssignments(prev => [...prev, newAssignment]);

      // Clear the current selections
      setValue("teacherGrades", []);
      setValue("subjects", []);
      setValue("teacherClass", []);
      setValue("medium", []);
    }
  };

  const isPending = isRegisteringBasic || isRegisteringStudent || isRegisteringTeacher || isRegisteringParent;

  return (
    <Box sx={{ width: "100%", maxWidth: 500, overflowY: "auto" }}>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {registeredUser && activeStep === 1 && (
        <Box sx={{ mb: 2, p: 2, borderRadius: 1, color: 'black' }}>
          <strong>Role:</strong> {registeredUser.userType}
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        {activeStep === 0 && (
          <Stack spacing={2}>
            {/* Full Name */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <TextField
                label="Full Name"
                fullWidth
                variant="outlined"
                {...register("name", { required: "Full name is required" })}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color={errors.name ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "40px"
                  }
                }}
              />
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <TextField
                label="Address"
                fullWidth
                variant="outlined"
                {...register("address", { required: "Address is required" })}
                error={!!errors.address}
                helperText={errors.address?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home color={errors.address ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "40px"
                  }
                }}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color={errors.email ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
                <TextField
                  label="Location"
                  fullWidth
                  variant="outlined"
                  {...register("location", { required: "Location is required" })}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home color={errors.location ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
              </Stack>
            </motion.div>

            {/* Birthday and Phone Number */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Birthday"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  {...register("birthDay", { required: "Birthday is required" })}
                  error={!!errors.birthDay}
                  helperText={errors.birthDay?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake color={errors.birthDay ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
                <TextField
                  label="Phone"
                  fullWidth
                  variant="outlined"
                  {...register("contact", { required: "Phone is required" })}
                  error={!!errors.contact}
                  helperText={errors.contact?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color={errors.contact ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
              </Stack>
            </motion.div>

            {/* Role and Gender */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Role"
                  fullWidth
                  variant="outlined"
                  {...register("userType", {
                    required: "Role is required",
                    onChange: (e) => setSelectedRole(e.target.value)
                  })}
                  error={!!errors.userType}
                  helperText={errors.userType?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work color={errors.userType ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Gender"
                  fullWidth
                  variant="outlined"
                  {...register("gender", {
                    required: "Gender is required"
                  })}
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work color={errors.gender ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                >
                  {gender.map((genderOption) => (
                    <MenuItem key={genderOption} value={genderOption}>
                      {genderOption}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </motion.div>

            {/* Username and Image Upload */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Username"
                  fullWidth
                  variant="outlined"
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                  })}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle color={errors.username ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
                {/* Image Upload */}
                {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{
                      height: '40px',
                      borderRadius: '10px',
                      textTransform: 'none',
                      width: '225px'
                    }}
                  >
                    Upload Profile Picture
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      name="photo"
                      required
                    />
                  </Button>
                  {previewImage && (
                    <Avatar
                      src={previewImage}
                      sx={{ width: 100, height: 100, mt: 2 }}
                    />
                  )}
                </Box> */}
              </Stack>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="outlined"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color={errors.password ? "error" : passwordFocused ? "primary" : "action"} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  variant="outlined"
                  {...register("password_confirmation", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  name="password_confirmation"
                  error={!!errors.password_confirmation}
                  helperText={errors.password_confirmation?.message}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color={errors.password_confirmation ? "error" : confirmPasswordFocused ? "primary" : "action"} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
              </Stack>
            </motion.div>
          </Stack>
        )}
        {/*Teacher Field*/}
        {activeStep === 1 && (
          <Stack spacing={2.5}>
            {selectedRole === "Teacher" && (
              <>
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Grades"
                    fullWidth
                    variant="outlined"
                    SelectProps={{
                      multiple: true,
                      value: watch("teacherGrades") || [],
                      onChange: (e) => {
                        const value = e.target.value as string[];
                        setValue("teacherGrades", value);
                      }
                    }}
                    {...register("teacherGrades")}
                    error={!!errors.teacherGrades}
                    helperText={errors.teacherGrades?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <School color={errors.teacherGrades ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        minHeight: "40px"
                      }
                    }}
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        {grade}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Subjects"
                    fullWidth
                    variant="outlined"
                    SelectProps={{
                      multiple: true,
                      value: watch("subjects") || [],
                      onChange: (e) => {
                        const value = e.target.value as string[];
                        setValue("subjects", value);
                      }
                    }}
                    {...register("subjects")}
                    error={!!errors.subjects}
                    helperText={errors.subjects?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Subject color={errors.subjects ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        minHeight: "40px"
                      }
                    }}
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </TextField>
                    <TextField
                    select
                    label="Medium"
                    fullWidth
                    variant="outlined"
                    SelectProps={{
                      multiple: true,
                      value: watch("medium") || [],
                      onChange: (e) => {
                        const value = e.target.value as string[];
                        setValue("medium", value);
                      }
                    }}
                    {...register("medium")}
                    error={!!errors.medium}
                    helperText={errors.medium?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Language color={errors.medium ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        minHeight: "40px"
                      }
                    }}
                  >
                    {mediumOptions.map((medium) => (
                      <MenuItem key={medium} value={medium}>
                        {medium}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Classes"
                    fullWidth
                    variant="outlined"
                    SelectProps={{
                      multiple: true,
                      value: watch("teacherClass") || [],
                      onChange: (e) => {
                        const value = e.target.value as string[];
                        setValue("teacherClass", value);
                      }
                    }}
                    {...register("teacherClass")}
                    error={!!errors.teacherClass}
                    helperText={errors.teacherClass?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Class color={errors.teacherClass ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        minHeight: "40px"
                      }
                    }}
                  >
                    {classes.map((classItem) => (
                      <MenuItem key={classItem} value={classItem}>
                        {classItem}
                      </MenuItem>
                    ))}
                  </TextField>
                   <TextField
                    label="Staff Number"
                    fullWidth
                    variant="outlined"
                    {...register("staffNo", { required: "Staff number is required" })}
                    error={!!errors.staffNo}
                    helperText={errors.staffNo?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AssignmentInd color={errors.staffNo ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        height: "55px"
                      }
                    }}
                  />
                
                 
                </Stack>
                 <Button
                    variant="contained"
                    onClick={handleAddAssignment}
                    sx={{
                      minWidth: '120px',
                      height: '40px',
                      borderRadius: '10px'
                    }}
                    startIcon={<Add />}
                  >
                    Add to List
                  </Button>

                {/* Assignments Grid */}
               {/* Assignments Grid */}
{teacherAssignments.length > 0 && (
  <Box sx={{ mt: 2, width: '100%' }}>
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: 220, // Set the height for scrolling
        overflowY: 'auto'
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Grades</TableCell>
            <TableCell>Subjects</TableCell>
            <TableCell>Classes</TableCell>
            <TableCell>Medium</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teacherAssignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>{assignment.grades.join(", ")}</TableCell>
              <TableCell>{assignment.subjects.join(", ")}</TableCell>
              <TableCell>{assignment.classes.join(", ")}</TableCell>
              <TableCell>{assignment.medium.join(", ")}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    setTeacherAssignments(prev => 
                      prev.filter(item => item.id !== assignment.id)
                    );
                  }}
                  size="small"
                  color="error"
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)}

              </>
            )}

            {selectedRole === "Student" && (
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Grade"
                  fullWidth
                  variant="outlined"
                  {...register("studentGrade", { required: "Grade is required" })}
                  error={!!errors.studentGrade}
                  helperText={errors.studentGrade?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School color={errors.grade ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Admission Number"
                  fullWidth
                  variant="outlined"
                  {...register("studentAdmissionNo", { required: "Admission number is required" })}
                  error={!!errors.studentAdmissionNo}
                  helperText={errors.studentAdmissionNo?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentInd color={errors.studentAdmissionNo ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                />
              </Stack>
            )}

            {selectedRole === "Parent" && (
              <><Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Profession"
                  fullWidth
                  variant="outlined"
                  {...register("profession", { required: "Profession is required" })}
                  error={!!errors.profession}
                  helperText={errors.profession?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work color={errors.profession ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }}
                >
                  {professions.map((profession) => (
                    <MenuItem key={profession} value={profession}>
                      {profession}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Contact Number"
                  fullWidth
                  variant="outlined"
                  {...register("parentContact", {
                    required: "Contact Number is required"
                  })}
                  error={!!errors.parentContact}
                  helperText={errors.parentContact?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Numbers color={errors.parentContact ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "40px"
                    }
                  }} />
              </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField

                    label="Student Admission No"
                    fullWidth
                    variant="outlined"
                    {...register("studentAdmissionNo", { required: "Student Admission No is required" })}
                    error={!!errors.studentAdmissionNo}
                    helperText={errors.studentAdmissionNo?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work color={errors.studentAdmissionNo ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        height: "40px"
                      }
                    }}
                  >
                  </TextField>
                  <TextField
                    select
                    label="Relation"
                    fullWidth
                    variant="outlined"
                    {...register("relation", { required: "Relation is required" })}
                    error={!!errors.relation}
                    helperText={errors.relation?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work color={errors.relation ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        height: "40px"
                      }
                    }}
                  >
                    {relations.map((relation) => (
                      <MenuItem key={relation} value={relation}>
                        {relation}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </>

            )}
          </Stack>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />

          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
            >
              {isPending ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" disabled={isPending}>
              {isPending ? <CircularProgress size={24} /> : 'Next'}
            </Button>
          )}
        </Box>

        {activeStep === 0 && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link to="/login">
              <Button startIcon={<AccountCircle />}>
                Already have an account? Sign In
              </Button>
            </Link>
          </Box>
        )}
      </form>
    </Box>
  );
};

export default RegisterForm;