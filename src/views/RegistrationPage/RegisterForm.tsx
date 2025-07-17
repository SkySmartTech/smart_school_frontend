import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  CardContent,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
  Zoom
} from "@mui/material";
import {
  AccountCircle,
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  Email,
  Phone,
  Badge,
  Work,

} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../api/userApi";
import { User } from "../../api/userApi";
import { useState } from "react";
import { motion } from "framer-motion";

interface RegisterFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const departments = ["HR", "Finance", "Production", "IT"];

interface FormData extends Omit<User, 'availability'> {
  availability: string;
  status: boolean;
  confirmPassword: string;
}

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
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
    const userData: any = {
      ...data,
      availability: data.availability === "Available",
      password_confirmation: data.confirmPassword,
    };
    registerMutation(userData);
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
    <Box sx={{ width: "90%", maxWidth: 500, height: "auto", maxHeight: 570, overflowY: "auto" }}>

      <CardContent sx={{ textAlign: "center", p: 1 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/images/lgo1.png" alt="Buildtek Logo" width="50px" />
          <Typography variant="h6" fontWeight="bold">Smart Flow</Typography>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography variant="h6" fontWeight="bold" mt={1} sx={{ textAlign: "left" }}>
            Sign Up
          </Typography>
        </motion.div>
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                label="EPF"
                fullWidth
                variant="outlined"
                {...register("epf", { required: "EPF is required" })}
                error={!!errors.epf}
                helperText={errors.epf?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge color={errors.epf ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "45px"
                  }
                }}
              />
              <TextField
                label="Employee Name"
                fullWidth
                variant="outlined"
                {...register("employeeName", { required: "Name is required" })}
                error={!!errors.employeeName}
                helperText={errors.employeeName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color={errors.employeeName ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "45px"
                  }
                }}
              />
            </Stack>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
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
                    height: "45px"
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
                    height: "45px"
                  }
                }}
              />
            </Stack>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
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
                  height: "45px"
                }
              }}
            />
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Department"
                fullWidth
                variant="outlined"
                {...register("department", { required: "Department is required" })}
                error={!!errors.department}
                helperText={errors.department?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work color={errors.department ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "45px"
                  }
                }}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Contact"
                fullWidth
                variant="outlined"
                {...register("contact")}
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
                    height: "45px"
                  }
                }}
              />
            </Stack>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
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
                    height: "48px"
                  }
                }}
              />

            </Stack>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >

          </motion.div>
        </Stack>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Box sx={{ mt: 2 }}>
            <Button
             
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isPending}
              sx={{
                borderRadius: "10px",
                height: 48,
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <Box sx={{ mt: 2, textAlign: "center" }}>
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