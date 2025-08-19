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
    MenuItem,
    Autocomplete
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import type {
    GridColDef,
    GridRenderCellParams,
    GridRowId,
    GridCellParams,
} from '@mui/x-data-grid';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

import {
    fetchStudentMarks,
    submitStudentMarks,
    fetchGradesFromApi,
    fetchClassesFromApi,
    type StudentMark,
    // getAuthToken // ⬅️ Remove this line to fix the warning
} from '../../api/addmarksApi';

import SchoolIcon from '@mui/icons-material/School';
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

interface FilterFormData {
    selectedGrade: string;
    selectedClass: string;
    selectedSubject: string;
    selectedExam: string;
    selectedMonth: string;
    searchQuery: string;
}

const TeacherDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [hovered] = useState(false);
    const theme = useTheme();

    const { control, watch, reset, formState: { errors } } = useForm<FilterFormData>({
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

    const [gradeOptions, setGradeOptions] = useState<{ label: string; value: string }[]>([]);
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([]);

    const [students, setStudents] = useState<StudentMark[]>([]);
    const [modifiedMarks, setModifiedMarks] = useState<Record<GridRowId, Partial<StudentMark>>>({});

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

    const isMonthFilterEnabled = selectedExam === 'monthly';

    const fetchData = useCallback(async () => {
        // ⬅️ FIX: Removed token from arguments and variable declaration.
        if (!selectedGrade || !selectedClass || !selectedSubject || !selectedExam) {
            console.log('Required filters not selected. Skipping data fetch.');
            setLoading(false);
            setStudents([]); 
            return;
        }
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
            setSnackbarMessage(`Failed to load student marks: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [selectedGrade, selectedClass, selectedSubject, selectedExam, selectedMonth, searchQuery, isMonthFilterEnabled]);

    const fetchOptions = useCallback(async () => {
        setLoading(true);
        try {
            // ⬅️ FIX: Removed token from arguments.
            const grades = await fetchGradesFromApi();
            setGradeOptions(grades);
            
            // ⬅️ FIX: Removed token argument.
            const classes = await fetchClassesFromApi(selectedGrade);
            setClassOptions(classes);
            
            setSnackbarMessage('Dropdown options loaded successfully.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Failed to fetch dropdown options:", error);
            setSnackbarMessage(`Failed to load dropdown options: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [selectedGrade]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

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
            // ⬅️ FIX: Removed token from arguments and variable declaration.
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
        <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
            <CssBaseline />
            <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />
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
                            sx={{ mb: 2 }}
                        >
                            <Controller
                                control={control}
                                name="selectedGrade"
                                render={({ field }) => (
                                    <Autocomplete
                                        value={gradeOptions.find(option => option.value === field.value) || null}
                                        onChange={(_event, newValue) => {
                                            field.onChange(newValue ? newValue.value : '');
                                        }}
                                        size="small"
                                        options={gradeOptions}
                                        getOptionLabel={(option) => option.label}
                                        sx={{
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: theme.palette.background.paper,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Student Grade"
                                                variant="outlined"
                                                error={!!errors.selectedGrade}
                                                helperText={!!errors.selectedGrade && "Required"}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SchoolIcon fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
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
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
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
                                            '& .MuiOutlinedInput-root': {
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
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
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
                                            flex: '1 1 50px',
                                            '& .MuiOutlinedInput-root': {
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
                                            flexGrow: 1,
                                            width: { xs: '100%', md: 'auto' },
                                            maxWidth: { xs: '100%', md: '500px' },
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