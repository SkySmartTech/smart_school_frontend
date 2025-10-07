import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    Link as MuiLink,
    Stack,
    CssBaseline,
    useTheme,
    AppBar
} from '@mui/material';
import {
    MenuBook as MenuBookIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
    HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

// Assume these components are imported from your existing structure
import Sidebar from "../components/Sidebar"; // Adjust path as necessary
import Navbar from "../components/Navbar";   // Adjust path as necessary
import { useCustomTheme } from '../context/ThemeContext'; // Assuming you have this context

// Define the structure for a single manual link
interface ManualLinkProps {
    title: string;
    description: string;
    onClick: () => void; // Function to handle navigation/opening PDF
}

// Helper component for a single manual link, designed to be clickable
const ManualLink: React.FC<ManualLinkProps> = ({ title, description, onClick }) => {
    const theme = useTheme();

    return (
        <MuiLink
            component="button"
            onClick={onClick}
            sx={{
                width: '100%',
                textAlign: 'left',
                p: 2,
                borderRadius: theme.shape.borderRadius,
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    textDecoration: 'none',
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: theme.palette.text.primary,
                transition: 'background-color 0.2s',
            }}
            underline="none"
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <MenuBookIcon color="primary" />
                <Box>
                    <Typography variant="body1" fontWeight={600} color="text.primary">
                        {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {description}
                    </Typography>
                </Box>
            </Stack>
            <ArrowForwardIosIcon sx={{ fontSize: 'small', color: theme.palette.text.secondary }} />
        </MuiLink>
    );
};

const HelpPage: React.FC = () => {
    const theme = useTheme();
    useCustomTheme(); // Initialize custom theme/mode logic
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- Manual Handlers (Placeholders) ---
    const handleManualClick = (manualType: string) => {
        // In a real application, this would navigate to a specific route 
        // or open a PDF/external link for the manual.
        console.log(`Opening ${manualType} Manual...`);
        alert(`Simulating opening ${manualType} Manual.`);
    };
    // -------------------------------------

    const manuals = [
        { 
            title: "Parent's Manual", 
            description: "Guide for parents on viewing reports and interacting with the system.",
            handler: () => handleManualClick("Parent") 
        },
        { 
            title: "Student's Manual", 
            description: "Instructions for students on accessing lessons and checking homework.",
            handler: () => handleManualClick("Student") 
        },
        { 
            title: "Teacher's Manual", 
            description: "Detailed guide for teachers on grading, attendance, and content management.",
            handler: () => handleManualClick("Teacher") 
        },
    ];

    return (
        <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
            <CssBaseline />
            <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
            />
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <AppBar
                    position="static"
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 'none',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        zIndex: theme.zIndex.drawer + 1,
                        color: theme.palette.text.primary
                    }}
                >
                    <Navbar
                        title="Help & Manuals"
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                </AppBar>

                {/* Main Content Area */}
                <Box
                    sx={{
                        p: 3,
                        flexGrow: 1,
                        overflow: "auto",
                        display: 'flex',
                        justifyContent: 'center', // Center card horizontally
                        alignItems: 'flex-start', // Align card to the top
                        backgroundColor: theme.palette.background.default, // Match overall background
                    }}
                >
                    {/* The minimalist Card based on User Profile screenshot */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 4,
                            width: { xs: '95%', sm: 600, md: 700 }, // Max width for minimalist look
                            borderRadius: 2,
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                            <HelpOutlineIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                            <Typography variant="h5" fontWeight={700}>
                                System Manuals....!
                            </Typography>
                        </Stack>
                        
                        <Divider sx={{ mb: 3 }} />

                        {/* Manual Links Section */}
                        <Stack spacing={1}>
                            {manuals.map((manual, index) => (
                                <React.Fragment key={manual.title}>
                                    <ManualLink
                                        title={manual.title}
                                        description={manual.description}
                                        onClick={manual.handler}
                                    />
                                    {/* Add divider between items, but not after the last one */}
                                    {index < manuals.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </Stack>

                        <Divider sx={{ mt: 3, mb: 2 }} />

                        <Box sx={{ textAlign: 'right' }}>
                            {/* Optional button for further help/contact */}
                            <Button variant="outlined" color="primary">
                                Contact Support
                            </Button>
                        </Box>

                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default HelpPage;