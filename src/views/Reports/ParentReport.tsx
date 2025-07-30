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
import { DateRange, CalendarMonth } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    Legend,
    ResponsiveContainer } from "recharts";
import { useQuery,
    type UseQueryOptions } from "@tanstack/react-query";
import { fetchParentReport,
    fetchChildDetails, type ParentReportData,
    type ChildDetails, type IndividualSubjectAverageData, type StudentMarksData } from "../../api/parentApi.ts"; // Removed OverallSubjectLineGraphData as it's not directly used for types here

const years = ["2020", "2021", "2022", "2023", "2024"];
const exams = ["1st Term", "2nd Term", "3rd Term","Monthly"];
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#9C27B0", "#FF5722", "#00BCD4"];

const ParentReport: React.FC = () => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [year, setYear] = useState("2023");
  const [exam, setExam] = useState("2nd Term");
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
      queryKey: ["parent-report", studentId || '', year, exam],
      queryFn: () => {
        if (!studentId) throw new Error("Student ID not available");
        return fetchParentReport(studentId, year, exam);
      },
      enabled: !!studentId,
      retry: 1
    } as UseQueryOptions<ParentReportData, Error, ParentReportData, ["parent-report", string, string, string]>
  );

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
          <TableCell colSpan={3} align="center"><CircularProgress size={24} /></TableCell>
        </TableRow>
      );
    }
    if (!reportData || !reportData.studentMarksDetailedTable || reportData.studentMarksDetailedTable.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center">No detailed marks available for this period.</TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {reportData.studentMarksDetailedTable.map((row: StudentMarksData, idx: number) => (
          <TableRow key={idx} hover>
            <TableCell sx={{ fontWeight: 'bold' }}>{row.subject}</TableCell>
            <TableCell align="right">{row.marks}</TableCell>
            <TableCell align="right">{row.grade}</TableCell>
          </TableRow>
        ))}
        {reportData.studentMarksDetailedTable.length > 0 && (
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Overall Average</TableCell>
            <TableCell align="right">
              {(reportData.studentMarksDetailedTable.reduce((sum: number, current: StudentMarksData) => sum + current.marks, 0) / reportData.studentMarksDetailedTable.length).toFixed(1)}
            </TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        )}
      </>
    );
  };

  // Define subjects to display individual average charts for (now excluding Sinhala and Maths)
  const subjectsToChartAverage: (keyof IndividualSubjectAverageData)[] = [
    "English", // This one is still included for the "Other Individual Subject Average Trends" section
    "History", "Geography", "Buddhism",
    "Science", "Art", "EnglishLit"
  ];

  const renderIndividualSubjectAverageCharts = () => {
    if (isLoadingReport) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, width: '100%' }}><CircularProgress /></Box>
      );
    }
    if (!reportData || !reportData.individualSubjectAverages) {
      return (
        <Typography>No individual subject average data available.</Typography>
      );
    }

    return (
        <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="flex-start" sx={{ width: '100%' }}>
            {subjectsToChartAverage.map((subjectName: keyof IndividualSubjectAverageData) => {
                const data = reportData.individualSubjectAverages[subjectName];
                return (
                    <Paper
                        key={subjectName}
                        sx={{
                            p: 3,
                            flex: '1 1 calc(33.33% - 24px)', // Adjust calc for spacing: 3 charts, 2*spacing between them. (spacing=3 => 24px total)
                            maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 24px)' }, // Responsive widths
                            minWidth: '280px', // Prevents charts from becoming too small
                            boxSizing: 'border-box',
                            height: 'auto',
                            mb: 3 // Margin bottom for spacing between rows
                        }}
                    >
                        <Typography fontWeight={600} mb={2}>{subjectName}</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            {data && data.length > 0 ? (
                                <LineChart data={data}>
                                    <XAxis dataKey="x" />
                                    <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
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
                );
            })}
        </Stack>
    );
  };


  return (
    <Box sx={{ display: "flex", width: "99vw", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{
          boxShadow: "none", bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}>
          <Navbar title="Student Report" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </AppBar>

        <Stack spacing={3} sx={{ px: 4, py: 3 }}>
          {/* Student Details and Filters */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Stack direction="row" spacing={3} flexWrap="wrap">
                {/* Year */}
                <TextField
                  select
                  label="Year"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><DateRange /></InputAdornment>) }}
                  sx={{ minWidth: 250 }}
                >
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
                {/* Exam */}
                <TextField
                  select
                  label="Exam"
                  value={exam}
                  onChange={e => setExam(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonth /></InputAdornment>) }}
                  sx={{ minWidth: 250 }}
                >
                  {exams.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </TextField>
              </Stack>
              <Box sx={{
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  minWidth: 250,
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

          {/* First Row: Overall Subject & Subject Wise Marks (Pie Chart) */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
            {/* Overall Subject Line Chart */}
            <Paper sx={{ p: 3, flex: 2 }}> {/* flex: 2 to make it wider */}
              <Typography fontWeight={600} mb={2}>Overall Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                  <LineChart data={reportData?.overallSubjectLineGraph}>
                    <XAxis dataKey="x" />
                    <YAxis domain={[0, 100]} />
                    <ReTooltip />
                    <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Total Marks" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Paper>

            {/* Subject Wise Marks (Pie Chart) */}
            <Paper sx={{ p: 3, flex: 1 }}> {/* flex: 1 to make it smaller */}
              <Typography fontWeight={600} mb={2}>Subject Wise Marks</Typography>
              <ResponsiveContainer width="100%" height={250}>
                {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                  <PieChart>
                    <Pie data={reportData?.subjectWiseMarksPie} dataKey="value" nameKey="name" outerRadius={80} label={(entry: any) => entry.name}>
                      {(reportData?.subjectWiseMarksPie || []).map((_, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </Paper>
          </Stack>

    
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
            {/* Sinhala Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}> 
              <Typography fontWeight={600} mb={2}>Sinhala Subject Average Trend</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.Sinhala && reportData.individualSubjectAverages.Sinhala.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.Sinhala}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for Sinhala</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>

            {/* Maths Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}> {/* flex: 1 to share space */}
              <Typography fontWeight={600} mb={2}>Maths Subject Average Trend</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.Maths && reportData.individualSubjectAverages.Maths.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.Maths}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for Maths</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>

             {/* English Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}> 
              <Typography fontWeight={600} mb={2}>English Subject Average Trend</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.English && reportData.individualSubjectAverages.English.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.English}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for English</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>

          </Stack>

          {/* Individual Subject Average Charts (3 per row, for remaining subjects) */}
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} mb={2}>Other Individual Subject Average Trends</Typography>
            {renderIndividualSubjectAverageCharts()}
          </Paper>

          {/* Individual Subject Marks (Bar Chart for current exam) - Kept for reference, can be removed if not needed */}
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} mb={2}>Individual Subject Marks (Current Exam)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                <BarChart data={reportData?.studentMarksDetailedTable}>
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="marks" fill="#1976d2" radius={[5, 5, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Paper>

          {/* Detailed Marks Table for the specific student */}
          <Paper elevation={2} sx={{ p: 2, overflow: 'auto' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Detailed Marks Breakdown for {studentDetails?.studentName || 'Your Child'}</Typography>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell align="right">Marks</TableCell>
                    <TableCell align="right">Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderDetailedMarksTable()}
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