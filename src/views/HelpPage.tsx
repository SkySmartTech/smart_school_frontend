import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    InputBase,
    Link as MuiLink,
    Stack,
    CssBaseline,
    useTheme,
    AppBar
} from '@mui/material';
import {
    Search as SearchIcon,
    MenuBook as MenuBookIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
    RocketLaunch as RocketLaunchIcon,
    AccountCircle as AccountCircleIcon,
    Update as UpdateIcon,
    Settings as SettingsIcon,
    HelpOutline as HelpOutlineIcon,
    Lock as LockIcon,
    School as SchoolIcon,
    Group as GroupIcon,
    People as PeopleIcon
} from '@mui/icons-material';

// Assume these components are imported from your existing structure
import Sidebar from "../components/Sidebar"; // Adjust path as necessary
import Navbar from "../components/Navbar";   // Adjust path as necessary
import { useCustomTheme } from '../context/ThemeContext'; // Assuming you have this context

// --- Helper Components for the Slots ---

interface HelpSlotProps {
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
    isManual?: boolean;
}

const HelpSlot: React.FC<HelpSlotProps> = ({ icon, title, onClick, isManual = false }) => {
    const theme = useTheme();

    // Use a lighter gray for manuals, slightly darker for general topics
    const bgColor = isManual ? theme.palette.action.hover : theme.palette.background.default;

    return (
        <MuiLink
            component="button"
            onClick={onClick}
            sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: isManual ? '30%' : '30%' }, // Allows 3 manuals per row, 3 topics per row
                p: 2,
                borderRadius: theme.shape.borderRadius,
                backgroundColor: isManual ? theme.palette.grey[100] : theme.palette.grey[50], // Light gray background
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                transition: 'background-color 0.2s, transform 0.1s',
                '&:hover': {
                    backgroundColor: isManual ? theme.palette.grey[200] : theme.palette.action.hover,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[1],
                    textDecoration: 'none',
                },
                // Ensures color matches the mode regardless of parent linkf
                color: theme.palette.text.primary,
            }}
            underline="none"
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: theme.palette.primary.main }}>
                    {icon}
                </Box>
                <Typography variant="body1" fontWeight={500} sx={{ color: theme.palette.text.primary }}>
                    {title}
                </Typography>
            </Stack>
            {isManual && <ArrowForwardIosIcon sx={{ ml: 'auto', fontSize: 'small', color: theme.palette.text.secondary }} />}
        </MuiLink>
    );
};

// --- Main Component ---

const HelpPage: React.FC = () => {
    const theme = useTheme();
    useCustomTheme(); 
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSearch = () => {
        alert("Searching for help topics...");
    };

    const handleManualClick = (manualType: string) => {
        console.log(`Opening ${manualType} Manual...`);
        alert(`Simulating opening ${manualType} Manual.`);
    };

    const helpTopics = [
        { icon: <RocketLaunchIcon />, title: "Getting Started" },
        { icon: <AccountCircleIcon />, title: "My Account" },
        { icon: <UpdateIcon />, title: "System Updates" },
        { icon: <SettingsIcon />, title: "Settings & Preferences" },
        { icon: <HelpOutlineIcon />, title: "FAQs & Troubleshooting" },
        { icon: <LockIcon />, title: "Security & Privacy" },
    ];

    const manualSlots = [
        { icon: <PeopleIcon />, title: "Parent's Manual", handler: () => handleManualClick("Parent") },
        { icon: <SchoolIcon />, title: "Student's Manual", handler: () => handleManualClick("Student") },
        { icon: <MenuBookIcon />, title: "Teacher's Manual", handler: () => handleManualClick("Teacher") },
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
                        title="Help Center"
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
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Box 
                        sx={{ 
                            maxWidth: 900, 
                            margin: '0 auto', 
                            py: 2 
                        }}
                    >
                        {/* Search Bar Section (Matching the screenshot style) */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h5" fontWeight={600} mb={2} color="text.primary">
                                How can we help you...?
                            </Typography>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    maxWidth: 600,
                                    margin: '0 auto',
                                    borderRadius: theme.shape.borderRadius,
                                }}
                            >
                                <SearchIcon color="action" sx={{ ml: 1, mr: 1 }} />
                                <InputBase
                                    placeholder="Search"
                                    sx={{ ml: 1, flex: 1 }}
                                />
                                <Button 
                                    onClick={handleSearch} 
                                    variant="contained" 
                                    sx={{ height: 40, borderRadius: theme.shape.borderRadius }}
                                >
                                    SEARCH
                                </Button>
                            </Paper>
                        </Box>

                        {/* --- User Manuals Section --- */}
                        <Typography variant="h6" fontWeight={700} mb={2} color="text.primary">
                            User Manuals
                        </Typography>
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={2} 
                            mb={4} 
                            flexWrap="wrap"
                        >
                            {manualSlots.map((manual) => (
                                <HelpSlot 
                                    key={manual.title} 
                                    icon={manual.icon} 
                                    title={manual.title} 
                                    onClick={manual.handler} 
                                    isManual={true}
                                />
                            ))}
                        </Stack>
                        
                        <Divider sx={{ mb: 4 }} />

                        {/* Help Topics Section (Matching the screenshot style) */}
                        <Typography variant="h6" fontWeight={700} mb={2} color="text.primary">
                            Help Topics
                        </Typography>
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={2} 
                            flexWrap="wrap"
                            useFlexGap // Enables spacing even with flexWrap
                        >
                            {helpTopics.map((topic) => (
                                <HelpSlot 
                                    key={topic.title} 
                                    icon={topic.icon} 
                                    title={topic.title} 
                                    // onClick handler omitted or set to generic for placeholders
                                />
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default HelpPage;