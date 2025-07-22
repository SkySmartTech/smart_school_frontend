// src/pages/TeacherDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  CircularProgress,
  CssBaseline,
  AppBar,
  useTheme,
  Button,
  Typography,
  Paper,
  TextField, // Ensure TextField is imported
} from '@mui/material';

// Import DataGrid components
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';


// Import existing components
import FilterDropdown from '../../components/FilterDropdown';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

// Fix the typo here: changed 'SchoolTabelData' to 'SchoolTableData'
import { type TableData, marks_table } from '../../data/SchoolTabelData';


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
  { label: 'Class A', value: 'A' }, { label: 'Class B', value: 'B' },
  { label: 'Class C', value: 'C' }, { label: 'Class D', value: 'D' },
  { label: 'Class E', value: 'E' }, { label: 'Class F', value: 'F' },
  { label: 'Class G', value: 'G' }, { label: 'Class H', value: 'H' },
];

const subjectOptions = [
  { label: 'Mathematics', value: 'math' }, { label: 'Science', value: 'science' },
  { label: 'Religion', value: 'religion' },
  { label: 'Sinhala', value: 'sinhala' },
  { label: 'History', value: 'history' },
  { label: 'English', value: 'english' },
];

const termOptions = [
  { label: '1st Term', value: '1st' },
  { label: '2nd Term', value: '2nd' },
  { label: '3rd Term', value: '3rd' },
];

const TeacherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const theme = useTheme();

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  // State for the search query
  const [searchQuery, setSearchQuery] = useState<string>(''); // 👈 NEW: State for search bar
  // Use TableData for the students state
  const [students, setStudents] = useState<TableData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log('Fetching data for:', { selectedGrade, selectedClass, selectedSubject, selectedTerm, searchQuery }); // Include searchQuery
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real application, you would filter marks_table based on all selected filters and searchQuery here
      let filteredData = marks_table;
      
      // Basic filtering based on search query (example: by student name or admission number)
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter(student => 
          student.student_name.toLowerCase().includes(lowerCaseQuery) 
          //student.student_admission.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      setStudents(filteredData); // Use filtered data
      setLoading(false);
    };

    fetchData();
  }, [selectedGrade, selectedClass, selectedSubject, selectedTerm, searchQuery]); // 👈 NEW: Add searchQuery to dependencies

  // handleMarksChange now works directly with the students state in TeacherDashboard
  const handleMarksChange = (id: number, field: keyof TableData, value: any) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  const handleSubmitMarks = () => {
    console.log('Submitting Marks:', students);
    alert('Marks submitted successfully! (Check console for data)');
  };

  // Define columns for DataGrid directly in TeacherDashboard
  const columns: GridColDef[] = [
    { field: 'student_admission', headerName: 'Admission No', width: 130, editable: false },
    { field: 'student_name', headerName: 'Student Name', width: 500, editable: false },
    { field: 'term', headerName: 'Term', width: 150, editable: false },
    {
      field: 'marks',
      headerName: 'Marks',
      width: 150,
      editable: true,
      type: 'string',
      renderCell: (params: GridRenderCellParams<TableData, string>) => (
        <TextField
          variant="outlined"
          size="small"
          value={params.value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            // Allow empty string or 0-3 digit numbers
            if (newValue === '' || /^\d{0,3}$/.test(newValue)) {
              handleMarksChange(params.id as number, 'marks', newValue); // Call local handler
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
      valueFormatter: (params: { value: string | null | undefined; }) => {
        return params.value === '0' || params.value === '' ? '' : params.value;
      },
    },
    { field: 'student_grade', headerName: 'Grade', width: 150, editable: false },
  ];


  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          sx={{
            bgcolor: 'background.default',
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
            color: theme.palette.text.primary,
          }}
        >
          <Navbar
            title="Add Marks"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Container maxWidth="lg" sx={{ p: 3, bgcolor: '#fcfcfcff', minHeight: 'calc(100vh - 64px)' }}>
          {/* Filter Dropdowns */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            justifyContent="space-around"
            alignItems="flex-start"
            sx={{ mb: 3, p: { xs: 2, sm: 0 } }}
          >
            <FilterDropdown
              label="Grade"
              value={selectedGrade}
              options={gradeOptions}
              onChange={setSelectedGrade}
              minWidth={180}
            />
            <FilterDropdown
              label="Class"
              value={selectedClass}
              options={classOptions}
              onChange={setSelectedClass}
              minWidth={180}
            />
            <FilterDropdown
              label="Subject"
              value={selectedSubject}
              options={subjectOptions}
              onChange={setSelectedSubject}
              minWidth={180}
            />
            <FilterDropdown
              label="Term"
              value={selectedTerm}
              options={termOptions}
              onChange={setSelectedTerm}
              minWidth={180}
            />
          </Stack>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}> 
            <TextField
              label="Search Students" // Placeholder text
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: '100%', sm: '50%', md: '30%' }, // Medium length, responsive
                maxWidth: '400px', // Max width to keep it from getting too wide on large screens
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  bgcolor: 'white', // Consistent background
                  '&:hover fieldset': { borderColor: theme.palette.info.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.info.main },
                },
                mt: 2, // Margin top to separate from filters
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{
              mt: 3, p: 2, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[3], bgcolor: theme.palette.background.paper,
            }}>
              <Typography variant="h6" align="center" sx={{ mb: 2, color: theme.palette.text.primary }}>
                Add Marks
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={students} // Use the local 'students' state
                  columns={columns} // Use the local 'columns' definition
                  getRowId={(row) => row.id} // Essential for DataGrid to identify rows
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 5 }, },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                  processRowUpdate={(newRow, oldRow) => {
                    if (newRow.marks !== oldRow.marks) {
                      handleMarksChange(newRow.id, 'marks', newRow.marks); // Call local handler
                    }
                    return newRow;
                  }}
            onProcessRowUpdateError={(error) => console.error('Error updating row:', error)}
                  sx={{
                    // THIS IS THE PART THAT CONTROLS THE HEADER BACKGROUND COLOR
                    [`& .${gridClasses.columnHeaders}`]: {
                      backgroundColor: theme.palette.info.dark,
                    },
                    // And these lines control the text color and font weight within the header
                    [`& .${gridClasses.columnHeader}`]: {
                      color: theme.palette.text.primary,
                      fontWeight: 'bold',
                    },
                    // And these control the sorting/menu icon colors
                    [`& .${gridClasses.sortIcon}`]: {
                      color: theme.palette.text.secondary,
                    },
                    [`& .${gridClasses.menuIcon}`]: {
                      color: theme.palette.text.secondary,
                    },
                    // Footer styling
                    '.MuiDataGrid-footerContainer': { backgroundColor: theme.palette.background.paper, color: theme.palette.text.secondary, },
                    // Row styling
                    '.MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: theme.palette.background.paper, },
                    '.MuiDataGrid-row:nth-of-type(even)': { backgroundColor: theme.palette.background.paper, },
                    // Cell border
                    '.MuiDataGrid-cell': { borderColor: theme.palette.divider, },
                    // Hover effect for rows
                    '.MuiDataGrid-virtualScrollerContent': { '& .MuiDataGrid-row': { '&:hover': { backgroundColor: theme.palette.action.selected, }, }, },
                    // Main DataGrid border and radius
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmitMarks} // Call local handler
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    '&:hover': { bgcolor: theme.palette.primary.dark, },
                    color: theme.palette.primary.contrastText,
                    px: 5, py: 1.2, borderRadius: theme.shape.borderRadius,
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;