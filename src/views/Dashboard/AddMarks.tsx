import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Stack,
  CircularProgress,
  CssBaseline,
  AppBar,
  useTheme,
  Button,
  Typography,
  Paper,
  TextField,
  Snackbar,
  Alert,
  Box
} from '@mui/material';

// Import DataGrid components
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridCellParams,
} from '@mui/x-data-grid';

// Import existing components
import FilterDropdown from '../../components/FilterDropdown';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

// Import the API functions and the interface
import { fetchStudentMarks, submitStudentMarks, type StudentMark } from '../../api/addmarksApi';

// Import icons for FilterDropdowns
import SchoolIcon from '@mui/icons-material/School'; // For Grade
import ClassIcon from '@mui/icons-material/Class'; // For Class
import SubjectIcon from '@mui/icons-material/Subject'; // For Subject
import EventIcon from '@mui/icons-material/Event'; // For Exam/Term
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // For Month
import SearchIcon from '@mui/icons-material/Search'; // For Search field

const gradeOptions = [
  { label: 'Grade 1', value: '1' }, { label: 'Grade 2', value: '2' },
  { label: 'Grade 3', value: '3' }, { label: 'Grade 4', value: '4' },
  { label: 'Grade 5', value: '5' }, { label: 'Grade 6', value: '6' },
  { label: 'Grade 7', value: '7' }, { label: 'Grade 8', value: '8' },
  { label: 'Grade 9', value: '9' }, { label: 'Grade 10', value: '10' },
  { label: 'Grade 11', value: '11' }, { label: 'Grade 12', value: '12' },
  { label: 'Grade 13', value: '13' },
];

const classOptions = [
  { label: 'Araliya', value: 'Araliya' }, { label: 'Olu', value: 'Olu' },
  { label: 'Nelum', value: 'Nelum' }, { label: 'Rosa', value: 'Rosa' },
  { label: 'Manel', value: 'Manel' }, { label: 'Sooriya', value: 'Sooriya' },
  { label: 'Kumudu', value: 'Kumudu' }
];

const subjectOptions = [
  { label: 'Mathematics', value: 'math' }, { label: 'Science', value: 'science' },
  { label: 'Religion', value: 'religion' },
  { label: 'Sinhala', value: 'sinhala' },
  { label: 'History', value: 'history' },
  { label: 'English', value: 'english' },
];

const examOptions = [
  { label: '1st Term', value: '1st' },
  { label: '2nd Term', value: '2nd' },
  { label: '3rd Term', value: '3rd' },
  { label: 'Monthly', value: 'monthly' },
];

const monthOptions = [
  { label: 'January', value: 'January' }, { label: 'February', value: 'February' },
  { label: 'March', value: 'March' }, { label: 'April', value: 'April' },
  { label: 'May', value: 'May' }, { label: 'June', value: 'June' },
  { label: 'July', value: 'July' }, { label: 'August', value: 'August' },
  { label: 'September', value: 'September' }, { label: 'October', value: 'October' },
  { label: 'November', value: 'November' }, { label: 'December', value: 'December' },
];

const drawerWidth = 250;
const collapsedWidth = 56;

const TeacherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false); // hovered state is not used in the provided snippet
  const theme = useTheme();

  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [students, setStudents] = useState<StudentMark[]>([]);
  const [modifiedMarks, setModifiedMarks] = useState<Record<GridRowId, Partial<StudentMark>>>({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const isMonthFilterEnabled = selectedExam === 'monthly';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setStudents([]);
    setModifiedMarks({});
    try {
      const data = await fetchStudentMarks({
        grade: selectedGrade,
        class: selectedClass,
        subject: selectedSubject,
        term: selectedExam,
        month: isMonthFilterEnabled ? selectedMonth : '',
        searchQuery: searchQuery,
      });
      setStudents(data);
      setSnackbarMessage('Student marks loaded successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to fetch student marks:', error);
      setSnackbarMessage('Failed to load student marks. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, selectedClass, selectedSubject, selectedExam, selectedMonth, searchQuery, isMonthFilterEnabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarksChange = (id: GridRowId, field: keyof StudentMark, value: any) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id ? { ...student, [field]: value } : student
      )
    );
    setModifiedMarks((prevModified) => ({
      ...prevModified,
      [id]: { ...prevModified[id], [field]: value },
    }));
  };

  const handleSubmitMarks = async () => {
    setLoading(true);
    const marksToSubmit: Partial<StudentMark>[] = students.filter(student =>
      modifiedMarks[student.id] && modifiedMarks[student.id].marks !== undefined
    ).map(student => ({
      id: student.id,
      marks: student.marks,
      subject: student.subject,
      term: student.term,
      student_admission: student.student_admission,
      student_grade: student.student_grade,
      student_class: student.student_class,
      ...(isMonthFilterEnabled && selectedMonth && { month: selectedMonth }),
    }));

    if (marksToSubmit.length === 0) {
      setSnackbarMessage('No marks to submit.');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    try {
      await submitStudentMarks(marksToSubmit);
      setSnackbarMessage('Marks submitted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setModifiedMarks({});
    } catch (error) {
      console.error('Failed to submit marks:', error);
      setSnackbarMessage('Failed to submit marks. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedGrade('');
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedExam('');
    setSelectedMonth('');
    setSearchQuery('');
  };

  const columns: GridColDef<StudentMark>[] = [
    { field: 'student_admission', headerName: 'Admission No', width: 130, editable: false },
    { field: 'student_name', headerName: 'Student Name', width: 200, editable: false },
    { field: 'subject', headerName: 'Subject', width: 150, editable: false },
    { field: 'term', headerName: 'Term', width: 100, editable: false },
    {
      field: 'marks',
      headerName: 'Marks',
      width: 100,
      editable: true,
      type: 'string',
      renderCell: (params: GridRenderCellParams<StudentMark, string>) => (
        <TextField
          variant="outlined"
          size="small"
          value={params.value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            if (newValue === '' || /^\d{0,3}$/.test(newValue)) {
              handleMarksChange(params.id, 'marks', newValue);
            }
          }}
          inputProps={{ style: { textAlign: 'center', padding: '8px 10px' } }}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              '&:hover fieldset': { borderColor: theme.palette.info.main, },
              '&.Mui-focused fieldset': { borderColor: theme.palette.info.main, },
            },
          }}
        />
      ),
      valueFormatter: (params: GridCellParams<StudentMark, string>) => {
        if (params.value === undefined || params.value === null) {
          return '';
        }
        return params.value === '0' || params.value === '' ? '' : params.value;
      },
    },
    { field: 'student_grade', headerName: 'Marks Grade', width: 100, editable: false },
    { field: 'student_class', headerName: 'Class', width: 100, editable: false },
  ];

  return (
    <>
      <CssBaseline />
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />

      <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
        {/* Main content area, dynamically adjusting margin-left based on sidebar state */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            bgcolor: theme.palette.background.default,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ml: sidebarOpen ? `${drawerWidth}px` : `${collapsedWidth}px`, // Dynamic margin-left
          }}
        >
          <AppBar
            position="static"
            sx={{
              bgcolor: theme.palette.background.paper, // Changed background color
              boxShadow: 'none',
              borderBottom: `1px solid ${theme.palette.divider}`,
              zIndex: theme.zIndex.drawer + 1,
              color: theme.palette.text.primary,
              // Removed width and ml from AppBar as the Navbar handles it.
            }}
          >
            <Navbar
              title="Add Marks"
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </AppBar>

          <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>

            {/* Filter and Search Section */}
            <Paper sx={{
              mb: 3, p: 3, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[3], bgcolor: theme.palette.background.paper,
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                Filter Student Data
              </Typography>
              <Stack
                direction={{ xs: 'column', md: 'row' }} // Stack vertically on small screens, horizontally on medium and up
                spacing={{ xs: 2, md: 3 }}
                justifyContent="flex-start" // Align items to the start
                alignItems="flex-end" // Align items to the end for consistent button placement
                flexWrap="wrap"
                sx={{ mb: 2 }}
              >
                <FilterDropdown
                  label="Student Grade"
                  value={selectedGrade}
                  options={gradeOptions}
                  onChange={setSelectedGrade}
                  minWidth={264}
                  icon={<SchoolIcon fontSize="small" />} // Added icon
                />
                <FilterDropdown
                  label="Class"
                  value={selectedClass}
                  options={classOptions}
                  onChange={setSelectedClass}
                  minWidth={270}
                  icon={<ClassIcon fontSize="small" />} // Added icon
                />
                <FilterDropdown
                  label="Subject"
                  value={selectedSubject}
                  options={subjectOptions}
                  onChange={setSelectedSubject}
                  minWidth={270}
                  icon={<SubjectIcon fontSize="small" />} // Added icon
                />
                <FilterDropdown
                  label="Exam"
                  value={selectedExam}
                  options={examOptions}
                  onChange={setSelectedExam}
                  minWidth={270}
                  icon={<EventIcon fontSize="small" />} // Added icon
                />
                <FilterDropdown
                  label="Month"
                  value={selectedMonth}
                  options={monthOptions}
                  onChange={setSelectedMonth}
                  minWidth={270}
                  disabled={!isMonthFilterEnabled}
                  icon={<CalendarMonthIcon fontSize="small" />} // Added icon
                />
              </Stack>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 3 }}
                justifyContent="space-between" // Changed to space-between
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        <SearchIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                  sx={{
                    minWidth: 500, // Reduced minimum width
                    flexGrow: 1,
                    maxWidth: { xs: '100%', sm: 250 }, // Reduced maximum width for small and up screens
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      bgcolor: 'white',
                      '&:hover fieldset': { borderColor: theme.palette.info.main },
                      '&.Mui-focused fieldset': { borderColor: theme.palette.info.main },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    px: 3, py: 1, borderRadius: theme.shape.borderRadius,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      color: theme.palette.primary.dark,
                    },
                    mt: { xs: 2, sm: 0 }
                  }}
                >
                  Clear Filters
                </Button>
              </Stack>
            </Paper>

            {/* Data Table Section */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper sx={{
                mt: 3, p: 2, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[3], bgcolor: theme.palette.background.paper,
              }}>
                <Typography variant="h6" align="center" sx={{ mb: 2, color: theme.palette.text.primary }}>
                  Student Marks
                </Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={students}
                    columns={columns}
                    getRowId={(row) => row.id}
                    initialState={{
                      pagination: { paginationModel: { page: 0, pageSize: 5 }, },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{
                      '.MuiDataGrid-footerContainer': { backgroundColor: theme.palette.background.paper, color: theme.palette.text.secondary, },
                      '.MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: theme.palette.background.paper, },
                      '.MuiDataGrid-row:nth-of-type(even)': { backgroundColor: theme.palette.background.paper, },
                      '.MuiDataGrid-cell': { borderColor: theme.palette.divider, },
                      '.MuiDataGrid-virtualScrollerContent': { '& .MuiDataGrid-row': { '&:hover': { backgroundColor: theme.palette.action.selected, }, }, },
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmitMarks}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      '&:hover': { bgcolor: theme.palette.primary.dark, },
                      color: theme.palette.primary.contrastText,
                      px: 5, py: 1.2, borderRadius: theme.shape.borderRadius,
                    }}
                    disabled={loading}
                  >
                    Submit Marks
                  </Button>
                </Box>
              </Paper>
            )}
          </Container>
        </Box>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TeacherDashboard;