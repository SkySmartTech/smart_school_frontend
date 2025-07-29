// ClassTeacherReport.tsx
import React, { useState, useEffect } from "react";
import {
  Box, CssBaseline, AppBar, Stack, Typography, Paper, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useTheme, InputAdornment, TextField, CircularProgress, Snackbar, Alert
} from "@mui/material";
import { DateRange, School, CalendarMonth, Group } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchClassTeacherReport, type ClassTeacherReportData } from "../../api/classteacherApi.ts";
import type { SummaryData } from "../../api/summaryApi.ts";

const years = ["2020", "2021", "2022", "2023", "2024"];
const grades = ["1", "2", "3", "4"];
const classes = ["Olu", "Araliya", "Nelum"];
const exams = ["1st Term", "2nd Term", "3rd Term"];
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];

const ClassTeacherReport: React.FC = () => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [year, setYear] = useState("2023");
  const [grade, setGrade] = useState("1");
  const [className, setClassName] = useState("Olu");
  const [exam, setExam] = useState("2nd Term");
  type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
  };
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });

  const { data, isLoading, isError, error } = useQuery<ClassTeacherReportData, Error>({
    queryKey: ["class-teacher-report", year, grade, className, exam],
    queryFn: () => fetchClassTeacherReport(year, grade, className, exam),
    retry: 1
  });

  useEffect(() => {
    if (isError && error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  }, [isError, error]);


  // Calculate averages for the table
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));
  const calculateAverages = (tableData: any[] = []) => {
    if (!tableData.length) return { sinhala: '0', english: '0', maths: '0', overall: '0' };
    const totals = { sinhala: 0, english: 0, maths: 0 };
    tableData.forEach(row => {
      totals.sinhala += row.sinhala;
      totals.english += row.english;
      totals.maths += row.maths;
    });
    const averages = {
      sinhala: (totals.sinhala / tableData.length).toFixed(1),
      english: (totals.english / tableData.length).toFixed(1),
      maths: (totals.maths / tableData.length).toFixed(1),
      overall: ((totals.sinhala + totals.english + totals.maths) / (tableData.length * 3)).toFixed(1)
    };
    return averages;
  };
  const averages = calculateAverages((data as SummaryData | undefined)?.tableData);

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
          <Navbar title="Class Teacher Report" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </AppBar>

        <Stack spacing={3} sx={{ px: 4, py: 3 }}>
          {/* Filters */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="space-between">
              {/* Year */}
              <TextField select label="Year" value={year} onChange={e => setYear(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><DateRange /></InputAdornment>) }} sx={{ minWidth: 150 }}>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
              {/* Grade */}
              <TextField select label="Student Grade" value={grade} onChange={e => setGrade(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><School /></InputAdornment>) }} sx={{ minWidth: 150 }}>
                {grades.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
              {/* Class */}
              <TextField select label="Class" value={className} onChange={e => setClassName(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Group /></InputAdornment>) }} sx={{ minWidth: 150 }}>
                {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              {/* Exam */}
              <TextField select label="Exam" value={exam} onChange={e => setExam(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonth /></InputAdornment>) }} sx={{ minWidth: 150 }}>
                {exams.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </TextField>
            </Stack>
          </Paper>

          {/* Charts */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography fontWeight={600} mb={2}>Subject Wise Marks</Typography>
              <ResponsiveContainer width="100%" height={250}>
                 {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                  <PieChart>
                    <Pie data={data?.subjectPie} dataKey="value" outerRadius={80} labelLine={false}>
                      {(data?.subjectPie || []).map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </Paper>
            <Paper sx={{ p: 3, flex: 2 }}>
              <Typography fontWeight={600} mb={2}>Overall Subject</Typography>
              <ResponsiveContainer width="100%" height={250}>
                  {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                  <LineChart data={data?.lineGraph}>
                    <XAxis dataKey="x" />
                    <YAxis domain={[0, 100]} />
                    <ReTooltip />
                    <Line type="monotone" dataKey="y" stroke="#42A5F5" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Paper>
          </Stack>

          {/* Student Marks */}
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} mb={2}>Student Marks</Typography>
            <ResponsiveContainer width="100%" height={300}>
                 {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                <BarChart data={data?.studentMarks}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="marks" fill="#1976d2" radius={[5, 5, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Paper>

         {/* Table Section */}
                          <Paper elevation={2} sx={{ p: 2, overflow: 'auto' }}>
                              <Typography variant="h6" fontWeight={600} mb={2}>Detailed Marks Breakdown</Typography>
                              <TableContainer>
                                  <Table size="small" stickyHeader>
                                      <TableHead>
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                                              <TableCell align="right">Sinhala</TableCell>
                                              <TableCell align="right">English</TableCell>
                                              <TableCell align="right">Maths</TableCell>
                                              <TableCell align="right">Total</TableCell>
                                              <TableCell align="right">Average</TableCell>
                                          </TableRow>
                                      </TableHead>
                                      <TableBody>
                                          {isLoading ? (
                                              <TableRow>
                                                  <TableCell colSpan={2} align="center"><CircularProgress size={24} /></TableCell>
                                              </TableRow>
                                          ) : ((data as SummaryData | undefined)?.tableData || []).map((row: any, idx: number) => (
                                              <TableRow key={idx} hover>
                                                  <TableCell sx={{ fontWeight: 'bold' }}>{row.class}</TableCell>
                                                  <TableCell align="right">{row.sinhala}</TableCell>
                                                  <TableCell align="right">{row.english}</TableCell>
                                                  <TableCell align="right">{row.maths}</TableCell>
                                                  <TableCell align="right">{row.sinhala + row.english + row.maths}</TableCell>
                                                  <TableCell align="right">{((row.sinhala + row.english + row.maths) / 3).toFixed(1)}</TableCell>
                                              </TableRow>
                                          ))}
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Araliya</TableCell>
                                              <TableCell align="right">{averages.sinhala}</TableCell>
                                              <TableCell align="right">{averages.english}</TableCell>
                                              <TableCell align="right">{averages.maths}</TableCell>
                                              <TableCell align="right">{(parseFloat(averages.sinhala) + parseFloat(averages.english) + parseFloat(averages.maths)).toFixed(1)}</TableCell>
                                              <TableCell align="right">{averages.overall}</TableCell>
                                          </TableRow>
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Olu</TableCell>
                                              <TableCell align="right">{averages.sinhala}</TableCell>
                                              <TableCell align="right">{averages.english}</TableCell>
                                              <TableCell align="right">{averages.maths}</TableCell>
                                              <TableCell align="right">{(parseFloat(averages.sinhala) + parseFloat(averages.english) + parseFloat(averages.maths)).toFixed(1)}</TableCell>
                                              <TableCell align="right">{averages.overall}</TableCell>
                                          </TableRow>
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Nelum</TableCell>
                                              <TableCell align="right">{averages.sinhala}</TableCell>
                                              <TableCell align="right">{averages.english}</TableCell>
                                              <TableCell align="right">{averages.maths}</TableCell>
                                              <TableCell align="right">{(parseFloat(averages.sinhala) + parseFloat(averages.english) + parseFloat(averages.maths)).toFixed(1)}</TableCell>
                                              <TableCell align="right">{averages.overall}</TableCell>
                                          </TableRow>
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Rosa</TableCell>
                                              <TableCell align="right">{averages.sinhala}</TableCell>
                                              <TableCell align="right">{averages.english}</TableCell>
                                              <TableCell align="right">{averages.maths}</TableCell>
                                              <TableCell align="right">{(parseFloat(averages.sinhala) + parseFloat(averages.english) + parseFloat(averages.maths)).toFixed(1)}</TableCell>
                                              <TableCell align="right">{averages.overall}</TableCell>
                                          </TableRow>
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Manel</TableCell>
                                              <TableCell align="right">{averages.sinhala}</TableCell>
                                              <TableCell align="right">{averages.english}</TableCell>
                                              <TableCell align="right">{averages.maths}</TableCell>
                                              <TableCell align="right">{(parseFloat(averages.sinhala) + parseFloat(averages.english) + parseFloat(averages.maths)).toFixed(1)}</TableCell>
                                              <TableCell align="right">{averages.overall}</TableCell>
                                          </TableRow>
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Sooriya</TableCell>
                                              <TableCell align="right">{averages.sinhala}</TableCell>
                                              <TableCell align="right">{averages.english}</TableCell>
                                              <TableCell align="right">{averages.maths}</TableCell>
                                              <TableCell align="right">{(parseFloat(averages.sinhala) + parseFloat(averages.english) + parseFloat(averages.maths)).toFixed(1)}</TableCell>
                                              <TableCell align="right">{averages.overall}</TableCell>
                                          </TableRow>
                                          <TableRow>
                                              <TableCell sx={{ fontWeight: 'bold' }}>Kumudu</TableCell>
                                              <TableCell align="right">{averages.sinhala}</TableCell>
                                              <TableCell align="right">{averages.english}</TableCell>
                                              <TableCell align="right">{averages.maths}</TableCell>
                                              <TableCell align="right">{(parseFloat(averages.sinhala) + parseFloat(averages.english) + parseFloat(averages.maths)).toFixed(1)}</TableCell>
                                              <TableCell align="right">{averages.overall}</TableCell>
                                          </TableRow>
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

export default ClassTeacherReport;
