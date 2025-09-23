import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert
} from "@mui/material";
import {
  AccountCircle,
  Info,
  Visibility,
  VisibilityOff,
  Lock
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../services/authService";
import { motion } from "framer-motion";

interface LoginFormProps {
  onForgotPasswordClick: () => void;
}

interface LoginFormData {
  username: string;
  password: string;
}

interface BackendErrorResponse {
  message?: string;
  errors?: {
    username?: string[];
    password?: string[];
  };
}

const LoginForm = ({ onForgotPasswordClick }: LoginFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setRememberMe(true);
      setValue("username", rememberedUsername);
    }
  }, [setValue]);

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", data.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      // Store user data
      if (data) {
        localStorage.setItem('userData', JSON.stringify(data));
        
        // Check if access permissions exist and store them
        if (data.access && data.access.length > 0) {
          try {
            const userPermissions = JSON.parse(data.access[0]);
            localStorage.setItem('userPermissions', JSON.stringify(userPermissions));

            // Navigate based on permissions
            if (userPermissions.includes('teacherDashboard')) {
              navigate('/teacher-dashboard');
            } else if (userPermissions.includes('studentDashboard')) {
              navigate('/student-dashboard');
            } else {
              navigate('/dashboard');
            }
          } catch (error) {
            console.error('Error parsing permissions:', error);
            navigate('/dashboard'); // Default fallback
          }
        } else {
          console.warn('No permissions found in user data');
          navigate('/dashboard'); // Default fallback
        }
      }

      enqueueSnackbar("Welcome Back!", { variant: "success" });
    },
    onError: (error: any) => {
      console.log("Login error:", error);

      setBackendError(null);
      clearErrors();

      let errorMessage = "Login failed. Please try again.";
      const errorData: BackendErrorResponse = error.response?.data || {};

      // Handle network / localhost errors
      if (error.message === "Network Error") {
        errorMessage =
          "Cannot connect to the server. Please check if backend is running on localhost.";
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }

      // Collect field-specific errors
      const fieldErrors: string[] = [];

      if (errorData.errors) {
        if (errorData.errors.username) {
          setError("username", {
            type: "manual",
            message: errorData.errors.username[0],
          });
          fieldErrors.push(errorData.errors.username[0]);
        }

        if (errorData.errors.password) {
          setError("password", {
            type: "manual",
            message: errorData.errors.password[0],
          });
          fieldErrors.push(errorData.errors.password[0]);
        }

        // If both exist, combine message
        if (fieldErrors.length > 1) {
          errorMessage = fieldErrors.join(" & ");
        } else if (fieldErrors.length === 1) {
          errorMessage = fieldErrors[0];
        }
      }

      setBackendError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setBackendError(null);
    clearErrors();
    loginMutation(data);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500 }}>
      <CardContent sx={{ textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/images/lgo1.png" alt="Buildtek Logo" width="50px" />
          <Typography variant="subtitle1" fontWeight="bold">
            Student Management System
          </Typography>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            mt={1}
            sx={{ textAlign: "left" }}
          >
            Sign In
          </Typography>
        </motion.div>
      </CardContent>

      {backendError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: "10px",
              alignItems: "center",
            }}
            onClose={() => setBackendError(null)}
          >
            {backendError}
          </Alert>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Username"
          fullWidth
          variant="outlined"
          margin="normal"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
          })}
          error={!!errors.username}
          helperText={errors.username?.message}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              height: "55px",
            },
          }}
          autoComplete="username"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle
                  color={errors.username ? "error" : "action"}
                />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="outlined"
          margin="normal"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              height: "55px",
            },
          }}
          autoComplete="current-password"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock
                  color={
                    errors.password
                      ? "error"
                      : passwordFocused
                      ? "primary"
                      : "action"
                  }
                />
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
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="primary"
            />
          }
          label="Remember me"
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isPending}
          sx={{
            mb: 2,
            height: 48,
            borderRadius: "9px",
            fontSize: "1rem",
            fontWeight: "bold",
            textTransform: "none",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          {isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Sign In"
          )}
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            startIcon={<Info />}
            onClick={onForgotPasswordClick}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            Forgot password?
          </Button>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<AccountCircle />}
              sx={{
                textTransform: "none",
                color: "primary.main",
                "&:hover": {
                  color: "primary.dark",
                },
              }}
            >
              Create account
            </Button>
          </Link>
        </Box>
      </form>
    </Box>
  );
};

export default LoginForm;
