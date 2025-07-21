// src/App.tsx (Make sure TeacherDashboard is NOT imported here)
import { CssBaseline, styled } from "@mui/material";
import { SnackbarContent, SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from "./state/queryClient";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./Routes"; // AppRoutes is handling all your routing

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={2500}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            Components={{
              success: styled(SnackbarContent)(({ theme }) => ({
                backgroundColor: theme.palette.success.main,
                fontSize: '2rem',
                '&.large-message': {
                  fontSize: '2.5rem',
                  padding: '50px',
                  fontWeight: 'bold'
                }
              })),
              error: styled(SnackbarContent)(({ theme }) => ({
                backgroundColor: theme.palette.error.main,
              })),
            }}
          >
            <CssBaseline />
            <AppRoutes /> {/* All your routes are handled here */}
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;