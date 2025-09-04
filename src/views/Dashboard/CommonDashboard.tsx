// MaintenancePage.tsx
import React from "react";
import { Box, Button, Typography, Paper, Stack, CssBaseline, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { useNavigate } from "react-router-dom";

const MotionBox = motion(Box);

const FloatingShape: React.FC<{ size?: number; left?: string; top?: string; delay?: number }> = ({
  size = 120,
  left = "10%",
  top = "10%",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [-8, 8, -8], opacity: 1 }}
      transition={{ duration: 6, repeat: Infinity, delay }}
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        pointerEvents: "none",
        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))",
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#6EE7B7" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#g1)" opacity="0.95" />
      </svg>
    </motion.div>
  );
};

export default function MaintenancePage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, position: "relative" }}>
      <CssBaseline />

      {/* Decorative floating shapes */}
      <FloatingShape size={160} left="6%" top="8%" delay={0.2} />
      <FloatingShape size={100} left="82%" top="12%" delay={1.2} />
      <FloatingShape size={90} left="74%" top="68%" delay={0.6} />

      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          pt: { xs: 8, md: 14 },
          pb: { xs: 8, md: 14 },
          px: { xs: 3, md: 4 },
          display: "flex",
          gap: 4,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left: Illustration card */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ flex: 1, width: "100%" }}
        >
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 3,
              minHeight: 360,
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Inline SVG hero illustration — replace with image URL if you prefer */}
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <svg viewBox="0 0 800 520" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#EEF2FF" />
                    <stop offset="1" stopColor="#E0F2FE" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#sky)" rx="18" />
                {/* Stylized maintenance character */}
                <g transform="translate(160,70) scale(0.72)">
                  <circle cx="220" cy="120" r="80" fill="#fff" stroke="#c7d2fe" strokeWidth="6" />
                  <rect x="160" y="200" width="120" height="140" rx="12" fill="#fff" stroke="#c7d2fe" strokeWidth="6" />
                  <path d="M80 360 q120 -100 320 -40" fill="none" stroke="#93c5fd" strokeWidth="12" strokeLinecap="round" />
                  <g transform="translate(320,120)">
                    <motion.g
                      animate={{ rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ transformOrigin: "center" }}
                    >
                      <rect x="10" y="10" width="120" height="24" rx="6" fill="#f97316" />
                    </motion.g>
                  </g>
                </g>
              </svg>
            </Box>
          </Paper>
        </motion.div>

        {/* Right: Message and actions */}
        <MotionBox
  initial={{ x: 60, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.1 }}
  sx={{
    width: { xs: "100%", md: 420 },
    maxWidth: 480
  }}
>
          <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <RocketLaunchIcon sx={{ fontSize: 36, color: "primary.main" }} />
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Page Under Maintenance
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary">
                We’re polishing things up! This page is currently under maintenance — we’re making some improvements to serve you better.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Expected back: <strong>Soon</strong> — if you need immediate help, please visit the Dashboard or contact support.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} pt={1}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/")}
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ flex: 1, py: 1.4 }}
                >
                  Go to Dashboard
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/contact")}
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ flex: 1, py: 1.4 }}
                >
                  Contact Support
                </Button>
              </Stack>

              {/* subtle progress / hint */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tip: try refreshing in a few minutes. If the issue persists, open a ticket via the Contact page.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </MotionBox>
      </Box>

      {/* Footer small line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          width: "100%",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Your Company — status: maintenance
        </Typography>
      </Box>
    </Box>
  );
}
