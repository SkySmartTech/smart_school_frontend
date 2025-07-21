// src/pages/TeacherDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  CircularProgress,
  CssBaseline,
  AppBar, // AppBar for the Navbar
  useTheme, // To use theme for styling
} from '@mui/material';

// Import existing components
import FilterDropdown from '../../components/FilterDropdown';
import MarksEntryTable from '../../components/MarksEntryTable';
import Sidebar from '../../components/Sidebar'; // Assuming this path
import Navbar from '../../components/Navbar';   // Assuming this path

// Dummy Data for demonstration (same as before)
interface StudentData {
  admissionNo: string;
  studentName: string;
  term: string;
  marks: string;
}

const initialStudents: StudentData[] = [
  { admissionNo: '24084', studentName: 'Student Name 1', term: '2nd Term', marks: '' },
  { admissionNo: '24085', studentName: 'Student Name 2', term: '2nd Term', marks: '' },
  { admissionNo: '24086', studentName: 'Student Name 3', term: '2nd Term', marks: '' },
  { admissionNo: '24087', studentName: 'Student Name 4', term: '2nd Term', marks: '' },
  { admissionNo: '24088', studentName: 'Student Name 5', term: '2nd Term', marks: '' },
];

const gradeOptions = [
  { label: 'Grade 1', value: '1' },
  { label: 'Grade 2', value: '2' },
  { label: 'Grade 3', value: '3' },
  { label: 'Grade 4', value: '4' },
  { label: 'Grade 5', value: '5' },
  { label: 'Grade 6', value: '6' },
  { label: 'Grade 7', value: '7' },
  { label: 'Grade 8', value: '8' },
  { label: 'Grade 9', value: '9' },
  { label: 'Grade 10', value: '10' },
  { label: 'Grade 11', value: '11' },
  { label: 'Grade 12', value: '12' },
  { label: 'Grade 13', value: '13' },
];

const classOptions = [
  { label: 'Class A', value: 'A' },
  { label: 'Class B', value: 'B' },
  { label: 'Class C', value: 'C' },
  { label: 'Class D', value: 'D' },
  { label: 'Class E', value: 'E' },
  { label: 'Class F', value: 'F' },
  { label: 'Class G', value: 'G' },
  { label: 'Class H', value: 'H' },
];

const subjectOptions = [
  { label: 'Mathematics', value: 'math' },
  { label: 'Science', value: 'science' },
  { label: 'Religion', value: 'math' },
  { label: 'Sinhala', value: 'science' },
  { label: 'History', value: 'math' },
  { label: 'English', value: 'science' },
];

const termOptions = [
  { label: '1st Term', value: '1st' },
  { label: '2nd Term', value: '2nd' },
  { label: '3rd Term', value: '3rd' },
];

const TeacherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false); // Assuming 'hovered' is still used for sidebar logic if any
  const theme = useTheme();

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [students, setStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call based on filters
      console.log('Fetching data for:', { selectedGrade, selectedClass, selectedSubject, selectedTerm });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStudents(initialStudents); // Still using dummy for now
      setLoading(false);
    };

    fetchData();
  }, [selectedGrade, selectedClass, selectedSubject, selectedTerm]);

  const handleMarksChange = (index: number, value: string) => {
    const newStudents = [...students];
    newStudents[index].marks = value;
    setStudents(newStudents);
  };

  const handleSubmitMarks = () => {
    console.log('Submitting Marks:', students);
    alert('Marks submitted successfully! (Check console for data)');
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      {/* Sidebar Component */}
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* AppBar for Navbar */}
        <AppBar
          position="static"
          sx={{
            bgcolor: 'background.paper', // This might need to be adjusted to your desired navbar color
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
            color: theme.palette.text.primary,
          }}
        >
          {/* Navbar Component */}
          <Navbar
            title="Teacher Dashboard" // Title for the Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            // You can pass the user name here if your Navbar component supports it
            // For example, if Navbar has a `userName` prop:
            // userName="Mrs : H.K.M.P.D.Perera"
          />
        </AppBar>

        {/* Main Content Area */}
        <Container maxWidth="lg" sx={{ p: 3, bgcolor: '#F0F2F5', minHeight: 'calc(100vh - 64px)' }}> {/* Adjusted height to account for AppBar */}
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
            />
            <FilterDropdown
              label="Class"
              value={selectedClass}
              options={classOptions}
              onChange={setSelectedClass}
            />
            <FilterDropdown
              label="Subject"
              value={selectedSubject}
              options={subjectOptions}
              onChange={setSelectedSubject}
            />
            <FilterDropdown
              label="Term"
              value={selectedTerm}
              options={termOptions}
              onChange={setSelectedTerm}
            />
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <MarksEntryTable
              students={students}
              onMarksChange={handleMarksChange}
              onSubmit={handleSubmitMarks}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;