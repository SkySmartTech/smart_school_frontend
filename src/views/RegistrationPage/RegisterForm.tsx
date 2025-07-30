import {
  Box,
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
  Avatar,
  Stepper,
  Step,
  StepLabel
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
  CloudUpload,
  AssignmentInd,
  School,
  Class,
  Subject,
  Numbers
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../api/userApi";
import type { User } from "../../api/userApi";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const gender = ["Male", "Female"];
const roles = ["Teacher", "Student", "Parent"];
const professions = ["Engineer", "Doctor", "Teacher", "Designer", "Other"];
const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const subjects = ["Math", "Science", "English", "History", "Geography", "Art", "Music", "Physical Education", "Computer Science"];
const classes = ["Araliya", "Olu", "Nelum", "Rosa", "Manel", "Sooriya", "Kumudu"];

interface FormData extends Omit<User, 'image'> {
  image: FileList | null;
  password_confirmation: string;
  grade?: string;
  subject?: string;
  class?: string;
  location?: string;
  profession?: string;
  parentContact?: string;
  gender?: string;
  staffId?: string;
  student_admission_no?: string;
}

interface RegisterFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

const steps = ['Basic Information', 'Role Details'];

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormData>();

  const password = watch("password");
  const userType = watch("userType");

  useEffect(() => {
    setSelectedRole(userType);
  }, [userType]);

  const handleNext = async () => {
    let isValid = false;

    if (activeStep === 0) {
      isValid = await trigger([
        "name",
        "address",
        "email",
        "birthday",
        "contact",
        "userType",
        "username",
        "password",
        "password_confirmation",
        "image"
      ]);
    } else if (activeStep === 1) {
      if (selectedRole === "Teacher") {
        isValid = await trigger(["grade", "subject", "class", "staffId"]);
      } else if (selectedRole === "Student") {
        isValid = await trigger(["grade", "student_admission_no"]);
      } else if (selectedRole === "Parent") {
        isValid = await trigger(["profession", "parentContact"]);
      }
    }

    if (!isValid) return;
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      onSuccess();
      navigate("/login");
    },
    onError: (error: any) => {
      onError(error.response?.data?.message || "Registration failed");
    },
  });

  const onSubmit = (data: FormData) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        } else if (key !== 'password_confirmation') {
          formData.append(key, value as string | Blob);
        }
      }
    });

    registerMutation(formData as any);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setValue("image", event.target.files);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500, overflowY: "auto" }}>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

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
                  {...register("birthday", { required: "Birthday is required" })}
                  error={!!errors.birthday}
                  helperText={errors.birthday?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake color={errors.birthday ? "error" : "action"} />
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

            {/* Role */}
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
                    required: "Role is required",
                    onChange: (e) => setSelectedRole(e.target.value)
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
                  {gender.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                      name="image"
                      required
                    />
                  </Button>
                  {previewImage && (
                    <Avatar
                      src={previewImage}
                      sx={{ width: 100, height: 100, mt: 2 }}
                    />
                  )}
                </Box>
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

        {activeStep === 1 && (
          <Stack spacing={2.5}>
            {selectedRole === "Teacher" && (
              <>
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Grade"
                    fullWidth
                    variant="outlined"
                    {...register("grade", { required: "Grade is required" })}
                    error={!!errors.grade}
                    helperText={errors.grade?.message}
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
                    select
                    label="Subject"
                    fullWidth
                    variant="outlined"
                    {...register("subject", { required: "Subject is required" })}
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Subject color={errors.subject ? "error" : "action"} />
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
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Class"
                    fullWidth
                    variant="outlined"
                    {...register("class", { required: "Class is required" })}
                    error={!!errors.class}
                    helperText={errors.class?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Class color={errors.class ? "error" : "action"} />
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
                    {classes.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        {cls}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Staff Number"
                    fullWidth
                    variant="outlined"
                    {...register("staffId", { required: "Staff number is required" })}
                    error={!!errors.staffId}
                    helperText={errors.staffId?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AssignmentInd color={errors.staffId ? "error" : "action"} />
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
              </>
            )}

            {selectedRole === "Student" && (
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Grade"
                  fullWidth
                  variant="outlined"
                  {...register("grade", { required: "Grade is required" })}
                  error={!!errors.grade}
                  helperText={errors.grade?.message}
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
                  {...register("student_admission_no", { required: "Admission number is required" })}
                  error={!!errors.student_admission_no}
                  helperText={errors.student_admission_no?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentInd color={errors.student_admission_no ? "error" : "action"} />
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
              <Stack direction="row" spacing={2}>
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
                  select
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
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <MenuItem key={num} value={num.toString()}>
                      {num}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
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
            <Button onClick={handleNext} variant="contained">
              Next
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