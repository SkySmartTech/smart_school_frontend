import React, { useState, useEffect } from "react";
import {
  Box, CssBaseline, AppBar, Stack, Typography, Paper, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useTheme, InputAdornment, TextField, CircularProgress,
  Snackbar, Alert
} from "@mui/material";
import { DateRange, School, CalendarMonth, Group } from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchClassTeacherReport } from "../../api/classteacherApi";
import { format } from 'date-fns';

const grades = ["1", "2", "3", "4", "11"];
const classes = ["Olu", "Araliya", "Nelum"];
const exams = ["1st Term", "2nd Term", "3rd Term", "First"];
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#9C27B0", "#00ACC1"];
const BAR_COLORS = ['#E3B6E5', '#C5A6D9', '#A795CD', '#8A85C1', '#6D74B5', '#5163A9', '#34529C'];

interface StudentSubjectMark {
  subject: string;
  marks: number;
}

interface StudentMark {
  studentName: string;
  subjects: StudentSubjectMark[];
  total_marks: number;
  average_marks: number;
  rank: number;
}

interface SubjectMark {
  subject: string;
  average_marks: number;
  percentage: number;
}

interface ClassTeacherReportData {
  subject_marks: SubjectMark[];
  student_marks: StudentMark[];
}

const ClassTeacherReport: React.FC = () => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2023, 0, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2024, 11, 31));
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
    queryKey: ["class-teacher-report", startDate, endDate, grade, className, exam],
    queryFn: () => {
      const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';
      return fetchClassTeacherReport(formattedStartDate, formattedEndDate, grade, className, exam);
    },
    retry: 1
  });

  useEffect(() => {
    if (isError && error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  }, [isError, error]);

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const getStackedBarData = () => {
    if (!data?.student_marks) return [];

    return data.student_marks.map(student => {
      const subjectMarks: Record<string, number | string> = {
        name: student.studentName
      };

      student.subjects.forEach(subject => {
        subjectMarks[subject.subject] = subject.marks;
      });

      return subjectMarks;
    });
  };

  // Handle date changes with proper type conversion
  const handleStartDateChange = (newValue: Date | null) => {
    setStartDate(newValue || undefined);
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setEndDate(newValue || undefined);
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
          <Navbar title="Class Teacher Report" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </AppBar>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3} sx={{ px: 4, py: 3 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="space-between">
                <DatePicker
                  label="Start Date"
                  value={startDate || null}
                  onChange={handleStartDateChange}
                  slots={{
                    textField: (params: any) => (
                      <TextField
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRange />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          minWidth: 150,
                          flex: 1,
                          maxWidth: 250,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            height: "45px",
                          },
                        }}
                      />
                    )
                  }}
                />

                <DatePicker
                  label="End Date"
                  value={endDate || null}
                  onChange={handleEndDateChange}
                  minDate={startDate}
                  slots={{
                    textField: (params: any) => (
                      <TextField
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRange />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          minWidth: 150,
                          flex: 1,
                          maxWidth: 250,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            height: "45px",
                          },
                        }}
                      />
                    )
                  }}
                />

                <TextField
                  select
                  label="Student Grade"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><School /></InputAdornment>) }}
                  sx={{
                    minWidth: 150,
                    flex: 1,
                    maxWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "45px",
                    },
                  }}
                >
                  {grades.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  label="Class"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Group /></InputAdornment>) }}
                  sx={{
                    minWidth: 150,
                    flex: 1,
                    maxWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "45px",
                    },
                  }}
                >
                  {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  label="Exam"
                  value={exam}
                  onChange={e => setExam(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonth /></InputAdornment>) }}
                  sx={{
                    minWidth: 150,
                    flex: 1,
                    maxWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "45px",
                    },
                  }}
                >
                  {exams.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </TextField>
              </Stack>
            </Paper>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
              <Paper sx={{ p: 3, flex: 1 }}>
                <Typography fontWeight={600} mb={2}>Subject Wise Marks</Typography>
                <ResponsiveContainer width="100%" height={350}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <PieChart>
                      <Pie
                        data={data?.subject_marks.map(sm => ({
                          name: sm.subject,
                          value: sm.average_marks
                        }))}
                        dataKey="value"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      >
                        {data?.subject_marks.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip
                        formatter={(value: number) => [`${value}`, "Average Marks"]}
                        labelFormatter={(label) => label}
                      />
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </Paper>

              <Paper sx={{ p: 3, flex: 2 }}>
                <Typography fontWeight={600} mb={2}>Student Marks</Typography>
                <ResponsiveContainer width="100%" height={350}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <BarChart
                      data={getStackedBarData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ReTooltip />
                      <Legend />
                      {data?.subject_marks.map((subject, index) => (
                        <Bar
                          key={subject.subject}
                          dataKey={subject.subject}
                          stackId="a"
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                          name={subject.subject}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Paper>
            </Stack>

            <Paper elevation={2} sx={{ p: 2, overflow: 'auto' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Detailed Marks Breakdown</Typography>
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                      {data?.subject_marks.map((subject) => (
                        <TableCell key={subject.subject} align="right" sx={{ fontWeight: 'bold' }}>
                          {subject.subject}
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Average</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.student_marks.map((student) => (
                        <TableRow key={student.studentName} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{student.studentName}</TableCell>
                          {data.subject_marks.map((subject) => {
                            const subjectMark = student.subjects.find(s => s.subject === subject.subject);
                            return (
                              <TableCell key={`${student.studentName}-${subject.subject}`} align="right">
                                {subjectMark ? subjectMark.marks : '-'}
                              </TableCell>
                            );
                          })}
                          <TableCell align="right">{student.total_marks}</TableCell>
                          <TableCell align="right">{student.average_marks.toFixed(1)}</TableCell>
                          <TableCell align="right">{student.rank}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </LocalizationProvider>
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