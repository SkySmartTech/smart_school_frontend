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
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    Legend,
    ResponsiveContainer } from "recharts";
import { useQuery,
    type UseQueryOptions } from "@tanstack/react-query"; // FIX: Removed 'exemplify-specifics'
import { fetchParentReport,
    fetchChildDetails, type ParentReportData,
    type ChildDetails, type StudentMarksData } from "../../api/parentApi.ts";

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
  }


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

          {/* Row 1: Overall Subject & Subject Wise Marks (Pie Chart) */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
            {/* Overall Subject Line Chart */}
            <Paper sx={{ p: 3, flex: 2 }}>
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

          {/* Row 2: Sinhala and Maths Subject Average Charts */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
            {/* Sinhala Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Sinhala Subject</Typography>
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
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Maths Subject</Typography>
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

            {/* ICT Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>ICT Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.ICT && reportData.individualSubjectAverages.ICT.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.ICT}>
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

          </Stack>

          {/* Row 3: History, Geography, and Buddhism Charts */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
            {/* History Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>History Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.History && reportData.individualSubjectAverages.History.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.History}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for History</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>

            {/* Geography Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Geography Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.Geography && reportData.individualSubjectAverages.Geography.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.Geography}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for Geography</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>

            {/* Buddhism Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Buddhism Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.Buddhism && reportData.individualSubjectAverages.Buddhism.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.Buddhism}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for Buddhism</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>
          </Stack>

          {/* Row 4: Science, Commerce, and Drama Charts */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
            {/* Science Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Science Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.Science && reportData.individualSubjectAverages.Science.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.Science}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for Science</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>

            {/* Commerce Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Commerce Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.Commerce && reportData.individualSubjectAverages.Commerce.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.Commerce}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for Commerce</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>

            {/* Drama Subject Average Chart */}
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Drama Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoadingReport ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                      reportData?.individualSubjectAverages?.Drama && reportData.individualSubjectAverages.Drama.length > 0 ? (
                          <LineChart data={reportData.individualSubjectAverages.Drama}>
                              <XAxis dataKey="x" />
                              <YAxis domain={[0, 100]} label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}/>
                              <ReTooltip />
                              <Line type="monotone" dataKey="y" stroke="#42A5F5" name="Average Marks" />
                          </LineChart>
                      ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                              <Typography variant="body2" color="text.secondary">No data for Drama</Typography>
                          </Box>
                      )
                  )}
              </ResponsiveContainer>
            </Paper>
          </Stack>

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