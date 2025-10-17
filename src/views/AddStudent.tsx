import { useState, useEffect } from "react";

interface GradeOption {
  id: string;
  grade: string;
}

import {
  Box,
  AppBar,
  CssBaseline,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Close, Add, Delete } from "@mui/icons-material";

import Sidebar from "../components/Sidebar";
import { useCustomTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import {
  promoteStudents,
  getAvailableGrades,
  getAvailableClasses,
  fetchClassStudents,       
  type Student,
  type PromoteStudentsRequest
} from "../api/studentApi";

const AddStudent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const theme = useTheme();
  useCustomTheme();

  // Filter states
  const [year, setYear] = useState("");
  const [grade, setGrade] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Available options
  // Year dropdown must be hardcoded
  const YEARS = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
  const [years] = useState<string[]>(YEARS);
  const [grades, setGrades] = useState<(string | GradeOption)[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  // Students data
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  // Current year filter in dialog
  const [currentYearFilter, setCurrentYearFilter] = useState("");
  const [currentGradeFilter, setCurrentGradeFilter] = useState("");
  const [currentClassFilter, setCurrentClassFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Next year details
  const [nextYear, setNextYear] = useState("");
  const [nextGrade, setNextGrade] = useState("");
  const [nextClass, setNextClass] = useState("");

  // Notification
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // Load available grade options on mount
  useEffect(() => {
    void loadAvailableGrades();
  }, []);

  // Load students when filters change (year, grade, class)
  useEffect(() => {
    if (year && grade && classFilter) {
      void loadStudents();
    } else {
      setStudents([]);
    }
  }, [year, grade, classFilter]);

  // Load classes when grade changes
  useEffect(() => {
    if (grade) {
      void loadClasses(grade);
    } else {
      setClasses([]);
      setClassFilter("");
    }
  }, [grade]);

  const loadAvailableGrades = async () => {
    try {
      const gradesData = await getAvailableGrades();
      setGrades(gradesData);
    } catch (error) {
      showSnackbar("Failed to load available grades", "error");
    }
  };

  const loadClasses = async (grade: string) => {
    try {
      const classesData = await getAvailableClasses(grade);
      setClasses(classesData);
    } catch (error) {
      showSnackbar("Failed to load classes", "error");
    }
  };

  const loadStudents = async () => {
    if (!year || !grade || !classFilter) return;

    setLoading(true);
    try {
      // Use the new endpoint that returns class students for year/grade/class
      const studentsData = await fetchClassStudents(year, grade, classFilter);
      setStudents(studentsData);
    } catch (error) {
      showSnackbar("Failed to load students", "error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    // Set current filters to match main page filters
    setCurrentYearFilter(year);
    setCurrentGradeFilter(grade);
    setCurrentClassFilter(classFilter);
    setSelectedStudents([]);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudents([]);
    setSearchTerm("");
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudents(prev => [...prev, student]);
  };

  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handlePromoteStudents = async () => {
    if (selectedStudents.length === 0) {
      showSnackbar("Please select at least one student", "error");
      return;
    }

    if (!nextYear || !nextGrade || !nextClass) {
      showSnackbar("Please select next year details", "error");
      return;
    }

    try {
      const request: PromoteStudentsRequest = {
        students: selectedStudents.map(student => ({
          name: student.name,
          studentAdmissionNo: student.admissionNo,
          year: nextYear,
          studentGrade: nextGrade,
          studentClass: nextClass
        }))
      };

      const result = await promoteStudents(request);

      if (result.success) {
        showSnackbar(result.message, "success");
        handleCloseDialog();
        // Refresh the students list for the same filters
        void loadStudents();
      } else {
        showSnackbar(result.message, "error");
      }
    } catch (error) {
      showSnackbar("Failed to promote students", "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter students for current year table (exclude selected ones in dialog)
  const filteredStudents = students.filter(student =>
    (!currentYearFilter || student.year === currentYearFilter) &&
    (!currentGradeFilter || student.grade === currentGradeFilter) &&
    (!currentClassFilter || student.class === currentClassFilter) &&
    (!searchTerm ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    !selectedStudents.some(selected => selected.id === student.id)
  );

  // normalize grade/class values before rendering menu items
  const gradeToValue = (g: any) => {
    if (!g && g !== 0) return "";
    if (typeof g === "string") return g;
    // common shapes: { grade: "Grade 1" } or { id, grade, description, ... }
    return String(g.grade ?? g.name ?? g.value ?? JSON.stringify(g));
  };


  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen || hovered}
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
            title="Student Promotion"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Box sx={{ p: 3, flex: 1 }}>
          {/* Header with button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{ minWidth: 200 }}
            >
              Add Students to Next Year
            </Button>
          </Box>

          {/* Filter Section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filter Students
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              {/* First dropdown - Left aligned */}
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
                <FormControl
                  sx={{
                    minWidth: 250,
                    maxWidth: 350,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "50px",
                    },
                  }}
                >
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year}
                    label="Year"
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Middle dropdown - Centered */}
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
                <FormControl
                  sx={{
                    minWidth: 250,
                    maxWidth: 350,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "50px",
                    },
                  }}
                >
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={grade}
                    label="Grade"
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    {grades.map((g) => {
                      const gv = gradeToValue(g);
                      return (
                        <MenuItem key={gv || `grade-${grades.indexOf(g)}`} value={gv}>
                          {gv}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Stack>

              {/* Third dropdown - Right aligned */}
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
                <FormControl
                  sx={{
                    minWidth: 250,
                    maxWidth: 350,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      height: "50px",
                    },
                  }}
                >
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={classFilter}
                    label="Class"
                    onChange={(e) => setClassFilter(e.target.value)}
                  >
                    {classes.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Paper>

          {/* Students Table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Students List
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Admission No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Medium</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.admissionNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.medium}</TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No students found. Please select filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Promotion Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Promote Students to Next Year</Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Current Year Details */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Year Details
            </Typography>

            {/* Filters */}
            <Stack direction="row" spacing={2}>
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={currentYearFilter}
                    label="Year"
                    onChange={(e) => setCurrentYearFilter(e.target.value)}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={currentGradeFilter}
                    label="Grade"
                    onChange={(e) => setCurrentGradeFilter(e.target.value)}
                  >
                    {grades.map((g, index) => {
                      const gradeValue = typeof g === 'object' ? g.grade : g;
                      return (
                        <MenuItem
                          key={typeof g === 'object' ? g.id : `grade-${index}-${gradeValue}`}
                          value={gradeValue}
                        >
                          {gradeValue}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Stack>
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>

                <FormControl fullWidth size="small" disabled={!currentGradeFilter}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={currentClassFilter}
                    label="Class"
                    onChange={(e) => setCurrentClassFilter(e.target.value)}
                  >
                    {classes.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Students"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Stack>
            </Stack>

            {/* Students Table */}
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Admission No</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.admissionNo}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSelectStudent(student)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Next Year Details */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Next Year Details
            </Typography>

            {/* Next Year Filters */}
            <Stack direction="row" spacing={2}>
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Next Year</InputLabel>
                  <Select
                    value={nextYear}
                    label="Next Year"
                    onChange={(e) => setNextYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Next Grade</InputLabel>
                  <Select
                    value={nextGrade}
                    label="Next Grade"
                    onChange={(e) => setNextGrade(e.target.value)}
                  >
                    {grades.map((g, index) => {
                      const gradeValue = typeof g === 'object' ? g.grade : g;
                      return (
                        <MenuItem
                          key={typeof g === 'object' ? g.id : `next-grade-${index}-${gradeValue}`}
                          value={gradeValue}
                        >
                          {gradeValue}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Stack>
              <Stack sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
                <FormControl fullWidth size="small" disabled={!nextGrade}>
                  <InputLabel>Next Class</InputLabel>
                  <Select
                    value={nextClass}
                    label="Next Class"
                    onChange={(e) => setNextClass(e.target.value)}
                  >
                    {nextGrade ? classes.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    )) : []}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            {/* Selected Students Table */}
            <Typography variant="subtitle1" gutterBottom>
              Selected Students ({selectedStudents.length})
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Admission No</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.admissionNo}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveStudent(student.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No students selected
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePromoteStudents}
              disabled={selectedStudents.length === 0 || !nextYear || !nextGrade || !nextClass}
            >
              Save Promotion
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddStudent;