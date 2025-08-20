// src/pages/TeacherDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
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
    Box,
    InputAdornment,
    MenuItem
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import type {
    GridColDef,
    GridRenderCellParams,
    GridRowId,
} from '@mui/x-data-grid';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

import {
    submitStudentMarks,
    fetchGradesFromApi,
    fetchClassesFromApi,
    fetchAdmissionData,
    calculateGrade,
    type StudentMark,
} from '../../api/addmarksApi';

import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';

const subjectOptions = [
    { label: 'Mathematics', value: 'math' }, { label: 'Science', value: 'science' },
    { label: 'Religion', value: 'religion' },
    { label: 'Sinhala', value: 'sinhala' },
    { label: 'History', value: 'history' },
    { label: 'English', value: 'english' },
];

const examOptions = [
    { label: 'First Term', value: 'First' },
    { label: 'Second Term', value: 'Mid' },
    { label: 'Third Term', value: 'End' },
    { label: 'Monthly Test', value: 'Monthly' },
];

const monthOptions = [
    { label: 'January', value: 'January' }, { label: 'February', value: 'February' },
    { label: 'March', value: 'March' }, { label: 'April', value: 'April' },
    { label: 'May', value: 'May' }, { label: 'June', value: 'June' },
    { label: 'July', value: 'July' }, { label: 'August', value: 'August' },
    { label: 'September', value: 'September' }, { label: 'October', value: 'October' },
    { label: 'November', value: 'November' }, { label: 'December', value: 'December' },
];

interface FilterFormData {
    selectedGrade: string;
    selectedClass: string;
    selectedSubject: string;
    selectedExam: string;
    selectedMonth: string;
    searchQuery: string;
}

interface AdmissionData {
    id: number;
    student_admission: string;
    student_name: string;
}

const TeacherDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [gradeOptions, setGradeOptions] = useState<{ label: string; value: string }[]>([]);
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([]);
    const [students, setStudents] = useState<StudentMark[]>([]);
    const [admissionData, setAdmissionData] = useState<AdmissionData[]>([]);
    const [modifiedMarks, setModifiedMarks] = useState<Record<GridRowId, Partial<StudentMark>>>({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const theme = useTheme();

    const { control, watch, reset } = useForm<FilterFormData>({
        defaultValues: {
            selectedGrade: '',
            selectedClass: '',
            selectedSubject: '',
            selectedExam: '',
            selectedMonth: '',
            searchQuery: ''
        }
    });

    const formValues = watch();
    const { selectedGrade, selectedClass, selectedSubject, selectedExam, selectedMonth, searchQuery } = formValues;
    const isMonthFilterEnabled = selectedExam === 'monthly';

    // Fetch dropdown options
    const fetchOptions = useCallback(async () => {
        setLoading(true);
        try {
            const grades = await fetchGradesFromApi();
            setGradeOptions(grades);

            const classes = await fetchClassesFromApi(selectedGrade);
            setClassOptions(classes);
        } catch (error) {
            console.error("Failed to fetch dropdown options:", error);
            setSnackbarMessage(`Failed to load dropdown options: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [selectedGrade]);

    // Fetch admission data when grade and class are selected
    const fetchAdmissionDataHandler = useCallback(async () => {
        if (!selectedGrade || !selectedClass) {
            setAdmissionData([]);
            setStudents([]);
            return;
        }
        
        try {
            setLoading(true);
            const data = await fetchAdmissionData(selectedGrade, selectedClass, searchQuery);
            setAdmissionData(data);
            
            // Initialize students with admission data
            const initialStudents: StudentMark[] = data.map((item, index) => ({
                id: index + 1,
                student_admission: item.student_admission,
                student_name: item.student_name,
                student_grade: selectedGrade,
                student_class: selectedClass,
                subject: selectedSubject || '',
                term: selectedExam || '',
                marks: '',
                student_grade_value: '',
                month: isMonthFilterEnabled ? selectedMonth : undefined
            }));
            
            setStudents(initialStudents);
            setModifiedMarks({});
        } catch (error) {
            console.error('Failed to fetch admission data:', error);
            setSnackbarMessage(`Failed to load admission data: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [selectedGrade, selectedClass, selectedSubject, selectedExam, selectedMonth, isMonthFilterEnabled, searchQuery]);

    // Update students when subject or term changes
    useEffect(() => {
        if (admissionData.length > 0) {
            const updatedStudents = admissionData.map((item, index) => {
                // Find the existing student to preserve marks
                const existingStudent = students.find(s => s.student_admission === item.student_admission);
                
                return {
                    id: index + 1,
                    student_admission: item.student_admission,
                    student_name: item.student_name,
                    student_grade: selectedGrade,
                    student_class: selectedClass,
                    subject: selectedSubject || '',
                    term: selectedExam || '',
                    marks: existingStudent?.marks || '',
                    student_grade_value: existingStudent?.student_grade_value || '',
                    month: isMonthFilterEnabled ? selectedMonth : undefined
                };
            });
            setStudents(updatedStudents);
        }
    }, [selectedSubject, selectedExam, selectedMonth, isMonthFilterEnabled]);

    // Handle marks change and calculate grade
    const handleMarksChange = useCallback(async (id: GridRowId, value: string) => {
        // Validate marks input (only numbers, max 3 digits)
        if (value !== '' && !/^\d{0,3}$/.test(value)) {
            return;
        }

        let grade = '';
        if (value) {
            try {
                grade = await calculateGrade(value);
            } catch (error) {
                console.error('Failed to calculate grade:', error);
                grade = 'Error';
            }
        }

        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === id 
                    ? { ...student, marks: value, student_grade_value: grade } 
                    : student
            )
        );

        setModifiedMarks(prevModified => ({
            ...prevModified,
            [id]: { 
                ...prevModified[id], 
                marks: value, 
                student_grade_value: grade,
                student_admission: students.find(s => s.id === id)?.student_admission || ''
            },
        }));
    }, [students]);

    const handleSubmitMarks = async () => {
        setLoading(true);
        const marksToSubmit: Partial<StudentMark>[] = Object.entries(modifiedMarks)
            .filter(([_, mark]) => mark.marks !== undefined && mark.marks !== '')
            .map(([id, mark]) => {
                // Find the corresponding student data
                const student = students.find(s => s.id.toString() === id);
                if (!student) {
                    console.error(`Student not found for id ${id}`);
                    return null;
                }

                // Map exam values to full terms
                const getFullTerm = (term: string) => {
                    switch(term) {
                        case '1st': return 'First Term';
                        case '2nd': return 'Second Term';
                        case '3rd': return 'Third Term';
                        case 'monthly': return 'Monthly Test';
                        default: return term;
                    }
                };

                return {
                    id: parseInt(id as string),
                    student_admission: mark.student_admission || student.student_admission,
                    student_name: student.student_name,
                    student_grade: selectedGrade,
                    student_class: selectedClass,
                    subject: selectedSubject,
                    term: getFullTerm(selectedExam), // Convert to full term name
                    month: isMonthFilterEnabled ? selectedMonth : 'Not Applicable', // More explicit month value
                    marks: mark.marks || '0',
                    student_grade_value: mark.student_grade_value || 'N/A',
                };
            })
            .filter((mark): mark is NonNullable<typeof mark> => mark !== null);

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
            setSnackbarMessage(`Failed to submit marks: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
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
        reset();
        setAdmissionData([]);
        setStudents([]);
        setModifiedMarks({});
    };

    // Fetch options on component mount
    useEffect(() => {
        fetchOptions();
    }, []);

    // Fetch admission data when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAdmissionDataHandler();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [selectedGrade, selectedClass, searchQuery]);

    const columns: GridColDef<StudentMark>[] = [
        { field: 'student_admission', headerName: 'Admission No', width: 130, editable: false },
        { field: 'student_name', headerName: 'Student Name', width: 200, editable: false },
         { field: 'student_class', headerName: 'Class', width: 100, editable: false },
        { field: 'subject', headerName: 'Subject', width: 150, editable: false },
        { field: 'term', headerName: 'Term', width: 100, editable: false },
        {
            field: 'marks',
            headerName: 'Marks',
            width: 100,
            editable: true,
            renderCell: (params: GridRenderCellParams<StudentMark, string>) => (
                <TextField
                    variant="outlined"
                    size="small"
                    value={params.row.marks || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleMarksChange(params.row.id, e.target.value);
                    }}
                    inputProps={{ 
                        style: { textAlign: 'center', padding: '8px 10px' },
                        maxLength: 3
                    }}
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
        },
        { field: 'student_grade_value', headerName: 'Marks Grade', width: 100, editable: false },
       
    ];

    return (
        <Box sx={{ display: "flex", width: "99vw", minHeight: "100vh" }}>
            <CssBaseline />
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
                <AppBar position="static" sx={{
                    boxShadow: "none",
                    bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                }}>
                    <Navbar title="Add Marks" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </AppBar>

                <Stack spacing={3} sx={{ px: 2, py: 3, maxWidth: '100%' }}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: '10px' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                            Filter Student Data
                        </Typography>

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={{ xs: 1, md: 2 }}
                            flexWrap="wrap"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mb: 2 }}
                        >
                            
                              <Controller
                                control={control}
                                name="selectedGrade"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Student Grade"
                                        variant="outlined"
                                        sx={{
                                            minWidth: 150,
                                            maxWidth: 250,
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: "10px",
                                                height: "45px",
                                                bgcolor: theme.palette.background.paper,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <ClassIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        {gradeOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}

                                    </TextField>
                                )}
                            />
                            <Controller
                                control={control}
                                name="selectedClass"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Class"
                                        variant="outlined"
                                        sx={{
                                            minWidth: 150,
                                            maxWidth: 250,
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: "10px",
                                                height: "45px",
                                                bgcolor: theme.palette.background.paper,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <ClassIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        {classOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}

                                    </TextField>
                                )}
                            />
                            <Controller
                                control={control}
                                name="selectedSubject"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Subject"
                                        variant="outlined"
                                        sx={{
                                            flex: '1 1 50px',
                                            minWidth: 150,
                                            maxWidth: 250,
                                            '& .MuiOutlinedInput-root': {
                                                height: "45px",
                                                borderRadius: '10px',
                                                bgcolor: theme.palette.background.paper,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SubjectIcon fontSize="small" />
                                                </InputAdornment>
                                            ),

                                        }}
                                    >
                                        {subjectOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />

                            <Controller
                                control={control}
                                name="selectedExam"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Exam"
                                        variant="outlined"
                                        sx={{
                                             minWidth: 150,
                                            maxWidth: 250,
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
                                                height: "45px",
                                                borderRadius: '10px',
                                                bgcolor: theme.palette.background.paper,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EventIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        {examOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />

                            <Controller
                                control={control}
                                name="selectedMonth"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Month"
                                        variant="outlined"
                                        disabled={!isMonthFilterEnabled}
                                        sx={{
                                             minWidth: 150,
                                            maxWidth: 250,
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
                                                    height: "45px",
                                                    borderRadius: '10px',
                                                bgcolor: theme.palette.background.paper,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarMonthIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        {monthOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Stack>

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={{ xs: 1, md: 2 }}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Controller
                                control={control}
                                name="searchQuery"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Search"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: 150,
                                            maxWidth: 250,
                                            flexGrow: 1,
                                            width: { xs: '100%', md: 'auto' },
                                            
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                height: '45px',
                                                bgcolor: theme.palette.background.paper,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ mr: 1 }}>
                                                    <SearchIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Button
                                variant="outlined"
                                onClick={handleClearFilters}
                                sx={{
                                    px: 3, py: 1,
                                    borderRadius: '10px',
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        borderColor: theme.palette.primary.dark,
                                        color: theme.palette.primary.dark,
                                    },
                                    width: { xs: '100%', md: 'auto' }
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Stack>
                    </Paper>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Paper elevation={2} sx={{
                            mt: 3, p: 2, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[3], bgcolor: theme.palette.background.paper,
                            overflowX: 'auto'
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
                                <Box sx={{ maxWidth: 300, width: '100%' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmitMarks}
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            '&:hover': { bgcolor: theme.palette.primary.dark },
                                            color: theme.palette.primary.contrastText,
                                            px: 5,
                                            py: 1.2,
                                            borderRadius: theme.shape.borderRadius,
                                            width: '100%',
                                        }}
                                        disabled={loading}
                                    >
                                        Submit Marks
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Stack>
            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherDashboard;