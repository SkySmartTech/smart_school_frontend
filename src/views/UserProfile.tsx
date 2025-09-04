// src/components/UserProfile.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  Avatar,
  Paper,
  Skeleton
} from "@mui/material";
import { Edit as EditIcon, PhotoCamera, Refresh } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import { 
  fetchUserProfile, 
  updateUserProfile, 
  uploadUserPhoto, 
  checkAuthStatus 
} from "../api/userProfileApi";
import type { User } from "../types/userTypes";

// Grade options for dropdown
const grades = ["A", "B", "C", "D"];
// Class options for dropdown
const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
// Subject options for dropdown
const subjects = ["Math", "Science", "History", "Language", "Arts"];

const defaultUser: User = {
  id: 0,
  name: "",
  address: "",
  password: "********",
  birthDay: "",
  email: "",
  userType: "",
  gender: "",
  userRole: "",
  username: "",
  location: "",
  grade: "",
  contact: "",
  photo: "",
  subject: "",
  class: ""
};

const UserProfile: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);
  const [editUser, setEditUser] = useState<User>(defaultUser);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof User, string>>>({});

  const theme = useTheme();
  useCustomTheme();
  const queryClient = useQueryClient();

  // Check authentication status on component mount
  useEffect(() => {
    if (!checkAuthStatus()) {
      showSnackbar("Please login to view your profile", "warning");
    }
  }, []);

  const { data: user, isLoading: isDataLoading, isError, error, refetch } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('login') || error.message.includes('Session expired')) {
        return false;
      }
      return failureCount < 2;
    },

  });

  useEffect(() => {
    if (user) {
      setEditUser(user);
      // Initialize validation errors
      const errors = Object.keys(defaultUser).reduce((acc, key) => {
        acc[key as keyof User] = "";
        return acc;
      }, {} as Partial<Record<keyof User, string>>);
      setValidationErrors(errors);
    }
  }, [user]);

  // Handle query errors
  useEffect(() => {
    if (isError && error) {
      const isAuthError = error.message.includes('login') || error.message.includes('Session expired');
      showSnackbar(error.message, isAuthError ? "warning" : "error");
    }
  }, [isError, error]);

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, user }: { id: number; user: Partial<User> }) => 
      updateUserProfile(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setOpenEdit(false);
      showSnackbar("Profile updated successfully!", "success");
    },
    onError: (error: any) => {
      const isAuthError = error.message.includes('login') || error.message.includes('Session expired');
      showSnackbar(error.message || "Failed to update profile", isAuthError ? "warning" : "error");
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => uploadUserPhoto(file),
    onSuccess: (photoUrl) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setEditUser(prev => ({ ...prev, photo: photoUrl }));
      setOpenPhoto(false);
      showSnackbar("Photo uploaded successfully!", "success");
    },
    onError: (error: any) => {
      const isAuthError = error.message.includes('login') || error.message.includes('Session expired');
      showSnackbar(error.message || "Failed to upload photo", isAuthError ? "warning" : "error");
    }
  });

  const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const validateField = (name: keyof User, value: string) => {
    let error = '';
    switch (name) {
      case 'name': 
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'username': 
        if (!value.trim()) error = 'Username is required';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Username can only contain letters, numbers, and underscores';
        else if (value.length < 3) error = 'Username must be at least 3 characters';
        break;
      case 'email': 
        if (!value.trim()) error = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Please enter a valid email address';
        break;
      case 'contact': 
        if (!value.trim()) error = 'Contact is required';
        else if (!/^\+?[0-9]{10,15}$/.test(value.replace(/\s|-/g, ''))) error = 'Please enter a valid phone number (10-15 digits)';
        break;
      case 'grade': 
        if (!value.trim()) error = 'Grade is required';
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        else if (value.trim().length < 5) error = 'Address must be at least 5 characters';
        break;
      case 'birthDay':
        if (!value.trim()) error = 'Birthday is required';
        else {
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate >= today) error = 'Birthday must be in the past';
        }
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof User, value);
  };

  const validateAllFields = () => {
    const requiredFields = ['name', 'username', 'email', 'contact', 'grade', 'address', 'birthDay'];
    return requiredFields.every(field => 
      validateField(field as keyof User, editUser[field as keyof User] as string)
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      // Client-side validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showSnackbar('Please upload an image file (JPEG, PNG, GIF, or WebP)', 'error');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showSnackbar('File is too large. Please upload an image smaller than 5MB', 'error');
        return;
      }
      
      await uploadPhotoMutation.mutateAsync(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!validateAllFields()) {
      showSnackbar("Please fix all validation errors before saving", "error");
      return;
    }
    
    if (!checkAuthStatus()) {
      showSnackbar("Please login to update your profile", "warning");
      return;
    }
    
    try {
      const { photo, ...userData } = editUser;
      await updateProfileMutation.mutateAsync({ id: editUser.id, user: userData });
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleRefresh = () => {
    if (checkAuthStatus()) {
      refetch();
      showSnackbar("Refreshing profile data...", "info");
    } else {
      showSnackbar("Please login to refresh data", "warning");
    }
  };

  const isMutating = updateProfileMutation.isPending || uploadPhotoMutation.isPending;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
      {[...Array(13)].map((_, i) => (
        <Skeleton key={i} variant="text" height={24} />
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{ 
          bgcolor: theme.palette.background.paper, 
          boxShadow: 'none', 
          borderBottom: `1px solid ${theme.palette.divider}`, 
          color: theme.palette.text.primary 
        }}>
          <Navbar title="User Profile" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </AppBar>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={3}
            sx={{ 
              bgcolor: theme.palette.background.paper, 
              p: 4, 
              borderRadius: 3, 
              maxWidth: 900, 
              mx: "auto", 
              mt: 4,
              mb: 4
            }}
          >
            {/* Profile Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Avatar 
                  src={user?.photo || "/default-avatar.png"} 
                  sx={{ width: 100, height: 100, border: `3px solid ${theme.palette.primary.main}` }} 
                />
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {isDataLoading ? <Skeleton width={200} /> : user?.name || "Unknown User"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {isDataLoading ? <Skeleton width={150} /> : user?.userRole || "No Role"}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<PhotoCamera />}
                    onClick={() => setOpenPhoto(true)} 
                    disabled={isMutating}
                    sx={{ mt: 1 }}
                  >
                    Change Photo
                  </Button>
                </Box>
              </Box>
              
              <Button
                variant="outlined"
                onClick={handleRefresh}
                disabled={isDataLoading || isMutating}
                startIcon={<Refresh />}
              >
                Refresh
              </Button>
            </Box>

            {/* Error State */}
            {isError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error?.message || "Failed to load profile data"}
              </Alert>
            )}

            {/* User Information */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Personal Information
            </Typography>
            
            {isDataLoading ? (
              <LoadingSkeleton />
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <Typography><strong>Name:</strong> {user?.name || "-"}</Typography>
                <Typography><strong>Username:</strong> {user?.username || "-"}</Typography>
                <Typography><strong>Email:</strong> {user?.email || "-"}</Typography>
                <Typography><strong>Contact:</strong> {user?.contact || "-"}</Typography>
                <Typography><strong>Address:</strong> {user?.address || "-"}</Typography>
                <Typography><strong>Birthday:</strong> {user?.birthDay || "-"}</Typography>
                <Typography><strong>User Type:</strong> {user?.userType || "-"}</Typography>
                <Typography><strong>Gender:</strong> {user?.gender || "-"}</Typography>
                <Typography><strong>User Role:</strong> {user?.userRole || "-"}</Typography>
                <Typography><strong>Location:</strong> {user?.location || "-"}</Typography>
                <Typography><strong>Grade:</strong> {user?.grade || "-"}</Typography>
                <Typography><strong>Subject:</strong> {user?.subject || "-"}</Typography>
                <Typography><strong>Class:</strong> {user?.class || "-"}</Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={() => setOpenEdit(true)} 
                disabled={isMutating || isDataLoading || !user}
                sx={{ minWidth: 120 }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Edit Dialog */}
        <Dialog 
          open={openEdit} 
          onClose={() => setOpenEdit(false)} 
          maxWidth="md"
          fullWidth
          sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">Edit Profile Information</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={editUser.name}
                onChange={handleEditChange}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                required
              />
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={editUser.username}
                onChange={handleEditChange}
                error={!!validationErrors.username}
                helperText={validationErrors.username}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={editUser.email}
                onChange={handleEditChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                required
              />
              <TextField
                fullWidth
                label="Contact"
                name="contact"
                value={editUser.contact}
                onChange={handleEditChange}
                error={!!validationErrors.contact}
                helperText={validationErrors.contact}
                required
              />
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={editUser.address}
                onChange={handleEditChange}
                error={!!validationErrors.address}
                helperText={validationErrors.address}
                required
                sx={{ gridColumn: { md: "1 / -1" } }}
              />
              <TextField
                fullWidth
                label="Birthday"
                name="birthDay"
                type="date"
                value={editUser.birthDay}
                onChange={handleEditChange}
                error={!!validationErrors.birthDay}
                helperText={validationErrors.birthDay}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                select
                fullWidth
                label="Grade"
                name="grade"
                value={editUser.grade}
                onChange={handleEditChange}
                error={!!validationErrors.grade}
                helperText={validationErrors.grade}
                required
              >
                {grades.map((grade) => (
                  <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Subject"
                name="subject"
                value={editUser.subject}
                onChange={handleEditChange}
              >
                <MenuItem value="">Select Subject</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Class"
                name="class"
                value={editUser.class}
                onChange={handleEditChange}
              >
                <MenuItem value="">Select Class</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>Class {cls}</MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenEdit(false)} disabled={isMutating}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained" 
              disabled={isMutating}
              startIcon={isMutating ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isMutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openPhoto} onClose={() => setOpenPhoto(false)}>
          <DialogTitle>Upload New Photo</DialogTitle>
          <DialogContent>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isMutating} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPhoto(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;