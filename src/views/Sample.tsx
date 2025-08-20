// src/pages/UnderDevelopmentPage.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  CssBaseline,
  AppBar,
  useTheme,
  Button,
  Stack,
} from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCustomTheme } from "../context/ThemeContext";

const UnderDevelopmentPage = () => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  useCustomTheme();

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      <CssBaseline />
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <AppBar
          position="static"
          sx={{
            bgcolor: "background.paper",
            boxShadow: "none",
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
            color: theme.palette.text.primary,
          }}
        >
          <Navbar
            title="Under Development"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            p: 4,
          }}
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ConstructionIcon
              sx={{ fontSize: 120, color: theme.palette.primary.main }}
            />
          </motion.div>

          {/* Animated Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              mt={3}
              color="text.primary"
            >
              Page Under Development 🚀
            </Typography>
          </motion.div>

          {/* Subtext */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <Typography
              variant="body1"
              mt={2}
              mb={4}
              color="text.secondary"
              maxWidth={600}
            >
              We’re crafting something amazing here.  
              Please check back soon while our team works hard to bring this feature to life.
            </Typography>
          </motion.div>

          {/* Call to Action */}
          <Stack direction="row" spacing={2}>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.history.back()}
                sx={{ borderRadius: 50, px: 4 }}
              >
                Go Back
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ borderRadius: 50, px: 4 }}
              >
                Contact Support
              </Button>
            </motion.div>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default UnderDevelopmentPage;
