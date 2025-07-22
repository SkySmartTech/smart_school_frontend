import React from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  AppBar,
  CssBaseline,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import Footer from "../../components/Footer";

const dummyUser = {
  employeeName: "John Doe",
  username: "john_doe",
  email: "john.doe@example.com",
  password: "********",
  epf: "EMP123456",
  department: "IT",
  contact: "+94712345678",
  photo: "/default-avatar.png",
};

const UserProfile: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          sx={{
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
            color: theme.palette.text.primary,
          }}
        >
          <Navbar title="User Profile" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </AppBar>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Box
            sx={{
              maxWidth: 900,
              mx: "auto",
              mt: 8,
              p: 4,
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: theme.palette.background.paper,
            }}
            component={Paper}
          >
            {/* Avatar + Name */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar src={dummyUser.photo} sx={{ width: 100, height: 100 }} />
              <Box>
                <Typography variant="h5">{dummyUser.employeeName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {dummyUser.department} Department
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Profile Info */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Typography><strong>Username:</strong> {dummyUser.username}</Typography>
              <Typography><strong>Email:</strong> {dummyUser.email}</Typography>
              <Typography><strong>Password:</strong> {dummyUser.password}</Typography>
              <Typography><strong>EPF No:</strong> {dummyUser.epf}</Typography>
              <Typography><strong>Contact:</strong> {dummyUser.contact}</Typography>
              <Typography><strong>Department:</strong> {dummyUser.department}</Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" startIcon={<EditIcon />}>
                Edit Profile
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Box>
      <Footer />
    </Box>
    
  );
};

export default UserProfile;
