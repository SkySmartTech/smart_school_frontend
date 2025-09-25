// src/App.tsx (Make sure TeacherDashboard is NOT imported here)
import { CssBaseline } from "@mui/material";
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
            // Use Components prop correctly
            Components={{
              success: function SuccessSnackbar(props) {
                return (
                  <SnackbarContent
                    {...props}
                    style={{
                      backgroundColor: '#4caf50',
                      fontSize: '1rem'
                    }}
                  />
                );
              },
              error: function ErrorSnackbar(props) {
                return (
                  <SnackbarContent
                    {...props}
                    style={{
                      backgroundColor: '#f44336'
                    }}
                  />
                );
              }
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
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