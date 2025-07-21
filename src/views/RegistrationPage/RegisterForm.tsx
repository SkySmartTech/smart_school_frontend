import {
  Box,
  TextField,
  Button,
  MenuItem,
  CardContent,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
  Zoom,
  Avatar
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
  Group,
  Business,
  CloudUpload,
  FamilyRestroom,
  AssignmentInd
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../api/userApi";
import type { User } from "../../api/userApi";
import { useState, useRef } from "react";
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

const genders = ["Male", "Female", "Other", "Prefer not to say"];
const roles = ["Admin", "User", "Manager", "Editor", "Viewer"];
const mediums = ["Email", "Phone", "SMS", "WhatsApp", "All"];
const professions = ["Engineer", "Doctor", "Teacher", "Designer", "Other"];

interface FormData extends Omit<User, 'image'> {
  image: FileList | null;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  const password = watch("password");

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
        } else if (key !== 'confirmPassword') {
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
    <Box sx={{ width: "90%", maxWidth: 500, overflowY: "auto" }}>
      <CardContent sx={{ textAlign: "center", p: 1 }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
        </motion.div>
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
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
              {...register("fullName", { required: "Full name is required" })}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color={errors.fullName ? "error" : "action"} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  height: "35px"
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
                  height: "35px"
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
                  height: "35px"
                }
              }}
            />
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
                    height: "35px"
                  }
                }}
              />
              <TextField
                label="Phone"
                fullWidth
                variant="outlined"
                {...register("phone", { required: "Phone is required" })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color={errors.phone ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              />
            </Stack>
          </motion.div>

          {/* Medium and Gender */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Medium"
                fullWidth
                variant="outlined"
                {...register("medium", { required: "Medium is required" })}
                error={!!errors.medium}
                helperText={errors.medium?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color={errors.medium ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              >
                {mediums.map((medium) => (
                  <MenuItem key={medium} value={medium}>
                    {medium}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Gender"
                fullWidth
                variant="outlined"
                {...register("gender", { required: "Gender is required" })}
                error={!!errors.gender}
                helperText={errors.gender?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Group color={errors.gender ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              >
                {genders.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </motion.div>

          {/* ID and Role */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                label="ID Number"
                fullWidth
                variant="outlined"
                {...register("idNumber", { required: "ID is required" })}
                error={!!errors.idNumber}
                helperText={errors.idNumber?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentInd color={errors.idNumber ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              />
              <TextField
                select
                label="Role"
                fullWidth
                variant="outlined"
                {...register("role", { required: "Role is required" })}
                error={!!errors.role}
                helperText={errors.role?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work color={errors.role ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </motion.div>

          {/* Parent and Profession */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                label="Parent/Guardian"
                fullWidth
                variant="outlined"
                {...register("parent")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FamilyRestroom color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              />
              <TextField
                select
                label="Profession"
                fullWidth
                variant="outlined"
                {...register("profession")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              >
                {professions.map((profession) => (
                  <MenuItem key={profession} value={profession}>
                    {profession}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{
                  height: '35px',
                  borderRadius: '10px',
                  textTransform: 'none'
                }}
              >
                Upload Profile Picture
                <VisuallyHiddenInput 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  name="image"
                />
              </Button>
              {previewImage && (
                <Avatar
                  src={previewImage}
                  sx={{ width: 100, height: 100, mt: 2 }}
                />
              )}
            </Box>
          </motion.div>

          {/* Username and Password */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
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
                    height: "35px"
                  }
                }}
              />
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
                        {showPassword ? (
                          <Zoom in={showPassword}>
                            <VisibilityOff color={passwordFocused ? "primary" : "action"} />
                          </Zoom>
                        ) : (
                          <Zoom in={!showPassword}>
                            <Visibility color={passwordFocused ? "primary" : "action"} />
                          </Zoom>
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "35px"
                  }
                }}
              />
            </Stack>
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              variant="outlined"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={errors.confirmPassword ? "error" : confirmPasswordFocused ? "primary" : "action"} />
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
                      {showConfirmPassword ? (
                        <Zoom in={showConfirmPassword}>
                          <VisibilityOff color={confirmPasswordFocused ? "primary" : "action"} />
                        </Zoom>
                      ) : (
                        <Zoom in={!showConfirmPassword}>
                          <Visibility color={confirmPasswordFocused ? "primary" : "action"} />
                        </Zoom>
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  height: "35px"
                }
              }}
            />
          </motion.div>
        </Stack>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isPending}
              sx={{
                borderRadius: "10px",
                height: 40,
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              {isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Sign Up
                </motion.span>
              )}
            </Button>
          </Box>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <Box sx={{ mt: 1, textAlign: "center" }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Button
                startIcon={<AccountCircle />}
                sx={{
                  textTransform: "none",
                  color: "primary.main",
                  '&:hover': {
                    color: 'primary.dark'
                  }
                }}
              >
                Already have an account? Sign In
              </Button>
            </Link>
          </Box>
        </motion.div>
      </form>
    </Box>
  );
};

export default RegisterForm;