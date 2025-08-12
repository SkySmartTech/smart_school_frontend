import React, { useState, useEffect } from "react";
import {
    Box,
    CssBaseline,
    AppBar,
    Stack,
    Typography,
    Paper,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
    InputAdornment,
    TextField,
    CircularProgress,
    Snackbar,
    Alert
} from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import {
    useQuery,
    type UseQueryOptions
} from "@tanstack/react-query";
import {
    fetchParentReport,
    fetchChildDetails,
    type ParentReportData,
    type ChildDetails,
    type DetailedMarksTableRow
} from "../../api/parentApi.ts";


const exams = ["1st Term", "2nd Term", "3rd Term", "Monthly"];
const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#9C27B0", "#FF5722", "#00BCD4"];

const ParentReport: React.FC = () => {
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [exam, setExam] = useState("");
    const [month, setMonth] = useState("");
    const [studentId, setStudentId] = useState<string | null>(null);
    const [studentDetails, setStudentDetails] = useState<ChildDetails | null>(null);

    type SnackbarState = {
        open: boolean;
        message: string;
        severity: "success" | "info" | "warning" | "error";
    };
    const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });

    // Fetch child details
    const { isLoading: isLoadingChild, isError: isErrorChild, error: errorChild } = useQuery<ChildDetails, Error, ChildDetails, ["child-details"]>(
        {
            queryKey: ["child-details"],
            queryFn: fetchChildDetails,
            retry: 1,
            onSuccess: (data: ChildDetails) => {
                setStudentId(data.studentId);
                setStudentDetails(data);
            },
        } as UseQueryOptions<ChildDetails, Error, ChildDetails, ["child-details"]>
    );

    // Fetch parent report data
    const { data: reportData, isLoading: isLoadingReport, isError: isErrorReport, error: errorReport } = useQuery<ParentReportData, Error, ParentReportData, ["parent-report", string, string, string]>(
        {
            queryKey: ["parent-report", studentId || '', exam, month],
            queryFn: () => {
                if (!studentId) throw new Error("Student ID not available");
                return fetchParentReport(studentId, "2023", exam, exam === "Monthly" ? month : "");
            },
            enabled: !!studentId && !!exam, // Only fetch when studentId and exam are selected
            retry: 1
        } as UseQueryOptions<ParentReportData, Error, ParentReportData, ["parent-report", string, string, string]>
    );

    // Reset month when a non-monthly exam is selected
    useEffect(() => {
        if (exam !== "Monthly") {
            setMonth("");
        }
    }, [exam]);

    useEffect(() => {
        if (isErrorChild && errorChild) {
            setSnackbar({ open: true, message: `Failed to load child details: ${errorChild.message}`, severity: "error" });
        }
        if (isErrorReport && errorReport) {
            setSnackbar({ open: true, message: `Failed to load report data: ${errorReport.message}`, severity: "error" });
        }
    }, [isErrorChild, errorChild, isErrorReport, errorReport]);

    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    const renderDetailedMarksTable = () => {
        if (isLoadingReport) {
            return (
                <TableRow>
                    <TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell>
                </TableRow>
            );
        }
        if (!reportData || !reportData.studentMarksDetailedTable || reportData.studentMarksDetailedTable.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} align="center">No detailed marks available for this period.</TableCell>
                </TableRow>
            );
        }
        return (
            <>
                {reportData.studentMarksDetailedTable.map((row: DetailedMarksTableRow, idx: number) => (
                    <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{row.subject}</TableCell>
                        <TableCell align="center">{row.highestMarks}</TableCell>
                        <TableCell align="center">{row.highestMarkGrade}</TableCell>
                        <TableCell align="center">{row.studentMarks}</TableCell>
                        <TableCell align="center">{row.studentGrade}</TableCell>
                    </TableRow>
                ))}
                {reportData.studentMarksDetailedTable.length > 0 && (
                    <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Overall Average</TableCell>
                        <TableCell align="center">N/A</TableCell>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">
                            {(reportData.studentMarksDetailedTable.reduce((sum, current) => sum + current.studentMarks, 0) / reportData.studentMarksDetailedTable.length).toFixed(1)}
                        </TableCell>
                        <TableCell align="center"></TableCell>
                    </TableRow>
                )}
            </>
        );
    };

    const renderSubjectAverageCharts = () => {
        if (isLoadingReport) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, width: '100%' }}>
                    <CircularProgress />
                </Box>
            );
        }

        const individualSubjectAverages = reportData?.individualSubjectAverages;

        if (!individualSubjectAverages) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, width: '100%' }}>
                    <Typography variant="h6" color="text.secondary">No subject average data available.</Typography>
                </Box>
            );
        }

        const subjects = Object.keys(individualSubjectAverages);

        if (subjects.length === 0) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, width: '100%' }}>
                    <Typography variant="h6" color="text.secondary">No subject average data available.</Typography>
                </Box>
            );
        }

        return (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
                {subjects.map((subjectName) => (
                    <Paper key={subjectName} sx={{ p: 3, flex: 1 }}>
                        <Typography fontWeight={600} mb={2}>{subjectName} Subject</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            {individualSubjectAverages[subjectName] && individualSubjectAverages[subjectName].length > 0 ? (
                                <LineChart data={individualSubjectAverages[subjectName]}>
                                    <XAxis dataKey="x" />
                                    <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }} />
                                    <ReTooltip />
                                    <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                                </LineChart>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                                    <Typography variant="body2" color="text.secondary">No data for {subjectName}</Typography>
                                </Box>
                            )}
                        </ResponsiveContainer>
                    </Paper>
                ))}
            </Stack>
        );
    };

    return (
        <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
            <CssBaseline />
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
                <AppBar position="static" sx={{
                    boxShadow: "none", bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary
                }}>
                    <Navbar title="Parent Report" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </AppBar>

                <Stack spacing={3} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                    {/* Student Details and Filters */}
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" justifyContent="space-between" alignItems="center">
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
                                {/* Exam */}
                                <TextField select label="Exam"
                                    value={exam}
                                    onChange={e => setExam(e.target.value)}
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonth /></InputAdornment>) }}
                                    sx={{ minWidth: { xs: '100%', sm: 200 } }}
                                >
                                    {exams.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                                </TextField>
                                {/* Month Dropdown is now only visible for "Monthly" exam */}
                                <TextField
                                    select
                                    label="Month"
                                    value={month}
                                    onChange={e => setMonth(e.target.value)}
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonth /></InputAdornment>) }}
                                    sx={{ minWidth: { xs: '100%', sm: 200 } }}
                                    disabled={exam !== "Monthly"}
                                >
                                    {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                </TextField>
                            </Stack>
                            <Box sx={{
                                p: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: theme.shape.borderRadius,
                                minWidth: { xs: '100%', md: 250 },
                                textAlign: 'left'
                            }}>
                                {isLoadingChild ? <CircularProgress size={20} /> : (
                                    <>
                                        <Typography variant="body1" fontWeight="bold">Student Name: {studentDetails?.studentName || 'N/A'}</Typography>
                                        <Typography variant="body1" fontWeight="bold">Student Grade: {studentDetails?.grade || 'N/A'}</Typography>
                                        <Typography variant="body1" fontWeight="bold">Student Class: {studentDetails?.className || 'N/A'}</Typography>
                                    </>
                                )}
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Row 1: Overall Subject & Subject Wise Marks (Pie Chart) */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
                        {/* Overall Subject Bar Chart */}
                        <Paper sx={{ p: 3, flex: 2 }}>
                            <Typography fontWeight={600} mb={2}>Overall Subject</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                {isLoadingReport ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <BarChart data={reportData?.overallSubjectLineGraph}>
                                        <XAxis dataKey="year" />
                                        <YAxis domain={[0, 100]} />
                                        <ReTooltip />
                                        <Bar dataKey="firstTerm" fill="#0d1542ff" name="First Term" />
                                        <Bar dataKey="secondTerm" fill="#6c009eff" name="Second Term" />
                                        <Bar dataKey="thirdTerm" fill=" #E91E63" name="Third Term" />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </Paper>

                        {/* Subject Wise Marks (Pie Chart) */}
                        <Paper sx={{ p: 3, flex: 1 }}>
                            <Typography fontWeight={600} mb={2}>Subject Wise Marks</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                                    <PieChart>
                                        <Pie data={reportData?.subjectWiseMarksPie} dataKey="value" nameKey="name" outerRadius={80} label={(entry: any) => entry.name}>
                                            {(reportData?.subjectWiseMarksPie || []).map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                        </Pie>
                                        <ReTooltip />
                                        <Legend />
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </Paper>
                    </Stack>

                    {/* Dynamic Subject Average Charts */}
                    {renderSubjectAverageCharts()}

                    {/* Detailed Marks Table for the specific student */}
                    <Paper elevation={2} sx={{ p: 2, overflowX: 'auto' }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Detailed Marks Breakdown</Typography>
                        <TableContainer>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 100 }}>Subject</TableCell>
                                        <TableCell colSpan={2} align="center" sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>Highest Student</TableCell>
                                        <TableCell colSpan={2} align="center" sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>{studentDetails?.studentName || 'Your Child'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 70 }}>Marks</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 70 }}>Mark Grade</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 70 }}>Marks</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 70 }}>Mark Grade</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{renderDetailedMarksTable()}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                </Stack>
                <Footer />
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ParentReport;