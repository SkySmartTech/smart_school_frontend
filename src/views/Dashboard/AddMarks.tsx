import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    Chip,
    Tooltip
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
    type StudentMark,
} from '../../api/addmarksApi';

import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';

import useTeacherProfile from '../../hooks/useTeacherProfile';

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

const yearOptions = [
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
    { label: '2027', value: '2027' },
    { label: '2028', value: '2028' },
];

interface FilterFormData {
    selectedGrade: string;
    selectedClass: string;
    selectedSubject: string;
    selectedExam: string;
    selectedMonth: string;
    selectedYear: string;
    searchQuery: string;
}

interface AdmissionData {
    id: number;
    student_admission: string;
    student_name: string;
}

const TeacherDashboard: React.FC = () => {
    const { data: teacherProfile, isLoading: profileLoading } = useTeacherProfile();
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
    
    // Refs to prevent unnecessary re-renders and manage timeouts
    const admissionDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastFetchParamsRef = useRef<string>('');
    
    const theme = useTheme();

    const { control, watch, reset } = useForm<FilterFormData>({
        defaultValues: {
            selectedGrade: '',
            selectedClass: '',
            selectedSubject: '',
            selectedExam: '',
            selectedMonth: '',
            selectedYear: '', 
            searchQuery: ''
        }
    });

    const formValues = watch();
    const { selectedGrade, selectedClass, selectedSubject, selectedExam, selectedMonth, selectedYear, searchQuery } = formValues;
    const isMonthFilterEnabled = selectedExam === 'Monthly';

    // Helper function to format subject names to proper case
    const formatSubjectName = useCallback((subject: string): string => {
        if (!subject) return subject;
        return subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
    }, []);

    // Helper function to format exam names for submission (keeping the formatted version for API)
    const formatExamName = useCallback((exam: string): string => {
        const examMap: Record<string, string> = {
            'First Term': 'First',
            'Second Term': 'Mid',
            'Third Term': 'End',
            'Monthly Term': 'Monthly'
        };
        return examMap[exam] || exam;
    }, []);

    // Memoize subject options calculation - keep original casing as value
    const subjectOptions = useMemo(() => {
        if (!teacherProfile?.teacher_data || !Array.isArray(teacherProfile.teacher_data) || !selectedGrade || !selectedClass) {
            return [];
        }

        const subjects = teacherProfile.teacher_data
            .filter(teacher => 
                teacher.teacherGrade === selectedGrade && 
                teacher.teacherClass === selectedClass
            )
            .map(teacher => ({
                label: formatSubjectName(teacher.subject), 
                value: teacher.subject 
            }));

        // Remove duplicates based on original subject names
        return subjects.filter((subject, index, self) => 
            index === self.findIndex(s => s.value.toLowerCase() === subject.value.toLowerCase())
        );
    }, [teacherProfile?.teacher_data, selectedGrade, selectedClass, formatSubjectName]);

    // Memoize filtered students for search
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        
        const query = searchQuery.toLowerCase();
        return students.filter(student => 
            student.student_name.toLowerCase().includes(query) ||
            student.student_admission.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    // Check if form is valid for submission
    const isFormValid = useMemo(() => {
        return selectedGrade && selectedClass && selectedSubject && selectedExam && selectedYear &&
               (selectedExam !== 'Monthly' || selectedMonth);
    }, [selectedGrade, selectedClass, selectedSubject, selectedExam, selectedYear, selectedMonth]);

    // Count modified marks
    const modifiedCount = useMemo(() => {
        return Object.values(modifiedMarks).filter(mark => 
            mark.marks !== undefined && mark.marks !== ''
        ).length;
    }, [modifiedMarks]);

    // Stable utility functions
    const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    }, []);

    const calculateGrade = useCallback((marks: number): string => {
        if (marks < 0 || marks > 100) return "Invalid";
        if (marks <= 39) return "F";
        if (marks < 50) return "S";
        if (marks < 65) return "C";
        if (marks < 75) return "B";
        return "A";
    }, []);

    // Fetch grades only - called once on mount
    const fetchGrades = useCallback(async () => {
        if (profileLoading) return;
        
        setLoading(true);
        try {
            const grades = await fetchGradesFromApi();
            setGradeOptions(grades);
        } catch (error) {
            console.error("Failed to fetch grades:", error);
            showSnackbar(
                `Failed to load grades: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [profileLoading, showSnackbar]);

    // Fetch classes when grade changes
    const fetchClasses = useCallback(async (grade: string) => {
        if (!grade) {
            setClassOptions([]);
            return;
        }

        try {
            const classes = await fetchClassesFromApi(grade);
            setClassOptions(classes);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
            showSnackbar(
                `Failed to load classes: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
                'error'
            );
        }
    }, [showSnackbar]);

    // Fetch admission data with caching check
    const fetchAdmissionDataHandler = useCallback(async (grade: string, classValue: string, year: string) => {
        if (!grade || !classValue || !year) {
            setAdmissionData([]);
            setStudents([]);
            return;
        }

        // Create a cache key to prevent unnecessary API calls
        const cacheKey = `${grade}-${classValue}-${year}`;
        if (lastFetchParamsRef.current === cacheKey) {
            return; // Don't refetch if parameters haven't changed
        }

        try {
            setLoading(true);
            const data = await fetchAdmissionData(grade, classValue, '');
            setAdmissionData(data);
            lastFetchParamsRef.current = cacheKey;

            // Initialize students with admission data - use formatted subject name
            const initialStudents: StudentMark[] = data.map((item, index) => ({
                id: index + 1,
                student_admission: item.student_admission,
                student_name: item.student_name,
                student_grade: grade,
                student_class: classValue,
                subject: selectedSubject ? formatSubjectName(selectedSubject) : '', // Use formatted subject
                term: selectedExam || '',
                marks: '',
                student_grade_value: '',
                month: isMonthFilterEnabled ? selectedMonth : undefined,
                year: year
            }));

            setStudents(initialStudents);
            setModifiedMarks({});
        } catch (error) {
            console.error('Failed to fetch admission data:', error);
            showSnackbar(
                `Failed to load admission data: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [selectedSubject, selectedExam, selectedMonth, isMonthFilterEnabled, showSnackbar, formatSubjectName]);

    const processRowUpdate = useCallback((newRow: StudentMark) => {
        let grade = "";
        if (newRow.marks !== "") {
            const marks = parseInt(newRow.marks, 10);
            if (isNaN(marks) || marks < 0 || marks > 100) {
                showSnackbar('Please enter valid marks between 0 and 100', 'warning');
                return students.find(s => s.id === newRow.id) || newRow;
            }
            grade = calculateGrade(marks);
        }

        const updatedRow = { ...newRow, student_grade_value: grade };

        setStudents((prev) =>
            prev.map((s) => (s.id === updatedRow.id ? updatedRow : s))
        );

        setModifiedMarks((prevModified) => ({
            ...prevModified,
            [updatedRow.id]: {
                ...prevModified[updatedRow.id],
                marks: updatedRow.marks,
                student_grade_value: updatedRow.student_grade_value,
                student_admission: updatedRow.student_admission,
            },
        }));

        return updatedRow;
    }, [students, calculateGrade, showSnackbar]);

    const handleSubmitMarks = useCallback(async () => {
        if (!isFormValid) {
            showSnackbar('Please fill all required fields before submitting', 'warning');
            return;
        }

        setLoading(true);
        const marksToSubmit: Partial<StudentMark>[] = Object.entries(modifiedMarks)
            .filter(([_, mark]) => mark.marks !== undefined && mark.marks !== '')
            .map(([id, mark]) => {
                const student = students.find(s => s.id.toString() === id);
                if (!student) {
                    console.error(`Student not found for id ${id}`);
                    return null;
                }

                return {
                    id: parseInt(id as string),
                    student_admission: mark.student_admission || student.student_admission,
                    student_name: student.student_name,
                    student_grade: selectedGrade,
                    student_class: selectedClass,
                    subject: formatSubjectName(selectedSubject), // Ensure proper capitalization
                    term: formatExamName(selectedExam), 
                    month: isMonthFilterEnabled ? selectedMonth : 'Not Applicable',
                    marks: mark.marks || '0',
                    student_grade_value: mark.student_grade_value || 'N/A',
                    year: selectedYear
                };
            })
            .filter((mark): mark is NonNullable<typeof mark> => mark !== null);

        if (marksToSubmit.length === 0) {
            showSnackbar('No marks to submit.', 'info');
            setLoading(false);
            return;
        }

        try {
            await submitStudentMarks(marksToSubmit);
            showSnackbar(`Successfully submitted marks for ${marksToSubmit.length} students!`, 'success');
            setModifiedMarks({});
        } catch (error) {
            console.error('Failed to submit marks:', error);
            showSnackbar(
                `Failed to submit marks: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [isFormValid, modifiedMarks, students, selectedGrade, selectedClass, selectedSubject, selectedExam, selectedMonth, selectedYear, isMonthFilterEnabled, showSnackbar, formatSubjectName, formatExamName]);

    const handleCloseSnackbar = useCallback((_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    }, []);

    const handleClearFilters = useCallback(() => {
        reset();
        setAdmissionData([]);
        setStudents([]);
        setModifiedMarks({});
        setClassOptions([]);
        lastFetchParamsRef.current = '';
    }, [reset]);

    const handleClearChanges = useCallback(() => {
        setModifiedMarks({});
        setStudents(prev => prev.map(student => ({
            ...student,
            marks: '',
            student_grade_value: ''
        })));
        showSnackbar('All unsaved marks cleared', 'info');
    }, [showSnackbar]);

    // Effect 1: Fetch grades only once when component mounts and profile loads
    useEffect(() => {
        if (!profileLoading && gradeOptions.length === 0) {
            fetchGrades();
        }
    }, [profileLoading]); // Only depend on profileLoading

    // Effect 2: Fetch classes when grade changes
    useEffect(() => {
        fetchClasses(selectedGrade);
    }, [selectedGrade]); // Only depend on selectedGrade

    // Effect 3: Reset subject if it's not available for the new grade/class combination
    useEffect(() => {
        if (selectedGrade && selectedClass && selectedSubject && subjectOptions.length > 0) {
            const availableSubjects = subjectOptions.map(s => s.value);
            if (!availableSubjects.includes(selectedSubject)) {
                reset({
                    ...formValues,
                    selectedSubject: ''
                });
            }
        }
    }, [subjectOptions]); // Only depend on subjectOptions

    // Effect 4: Debounced admission data fetching
    useEffect(() => {
        // Clear any existing timeout
        if (admissionDataTimeoutRef.current) {
            clearTimeout(admissionDataTimeoutRef.current);
        }

        // Only fetch if we have the required core fields
        if (selectedGrade && selectedClass && selectedYear) {
            admissionDataTimeoutRef.current = setTimeout(() => {
                fetchAdmissionDataHandler(selectedGrade, selectedClass, selectedYear);
            }, 300);
        } else {
            setAdmissionData([]);
            setStudents([]);
            lastFetchParamsRef.current = '';
        }

        return () => {
            if (admissionDataTimeoutRef.current) {
                clearTimeout(admissionDataTimeoutRef.current);
            }
        };
    }, [selectedGrade, selectedClass, selectedYear]); // Fixed dependencies

    // Effect 5: Update existing student fields when subject/exam/month changes
    useEffect(() => {
        if (admissionData.length > 0) {
            setStudents(prevStudents => 
                prevStudents.map(student => ({
                    ...student,
                    subject: selectedSubject ? formatSubjectName(selectedSubject) : '', // Use formatted subject
                    term: selectedExam || '',
                    month: isMonthFilterEnabled ? selectedMonth : undefined,
                    year: selectedYear || ''
                }))
            );
        }
    }, [selectedSubject, selectedExam, selectedMonth, isMonthFilterEnabled, selectedYear, admissionData.length, formatSubjectName]);

    // Memoized columns to prevent DataGrid re-renders
    const columns: GridColDef<StudentMark>[] = useMemo(() => [
        { field: 'student_admission', headerName: 'Admission No', width: 200, editable: false },
        { field: 'student_name', headerName: 'Student Name', width: 400, editable: false },
        { field: 'student_class', headerName: 'Class', width: 150, editable: false },
        { 
            field: 'subject', 
            headerName: 'Subject', 
            width: 150, 
            editable: false,
            renderCell: (params: GridRenderCellParams<StudentMark, string>) => (
                <span>{formatSubjectName(params.row.subject)}</span>
            )
        },
        { 
            field: 'term', 
            headerName: 'Term', 
            width: 130, 
            editable: false,
            renderCell: (params: GridRenderCellParams<StudentMark, string>) => (
                <span>{params.row.term}</span>
            )
        },
        { field: 'year', headerName: 'Year', width: 100, editable: false },
        {
            field: 'marks',
            headerName: 'Marks (0-100)',
            width: 140,
            editable: true,
            type: 'number',
            renderCell: (params: GridRenderCellParams<StudentMark, string>) => (
                <TextField
                    variant="outlined"
                    size="small"
                    value={params.row.marks || ''}
                    inputProps={{
                        style: { textAlign: 'center', padding: '8px 10px' },
                        min: 0,
                        max: 100,
                        maxLength: 3
                    }}
                    sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '4px',
                            '&:hover fieldset': { borderColor: theme.palette.info.main },
                            '&.Mui-focused fieldset': { borderColor: theme.palette.info.main },
                        },
                    }}
                />
            ),
        },
        { 
            field: 'student_grade_value', 
            headerName: 'Grade', 
            editable: false,
            width: 100,
            renderCell: (params: GridRenderCellParams<StudentMark, string>) => {
                const grade = params.row.student_grade_value;
                if (!grade) return null;
                
                const getGradeColor = (grade: string) => {
                    switch (grade) {
                        case 'A': return 'success';
                        case 'B': return 'info';
                        case 'C': return 'warning';
                        case 'S': return 'secondary';
                        case 'F': return 'error';
                        default: return 'default';
                    }
                };
                
                return (
                    <Chip 
                        label={grade} 
                        color={getGradeColor(grade) as any}
                        size="small"
                        variant="filled"
                    />
                );
            }
        },
    ], [theme.palette.info.main, formatSubjectName]);

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
                                        disabled={!selectedGrade || !selectedClass || subjectOptions.length === 0}
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
                                        {subjectOptions.length === 0 ? (
                                            <MenuItem value="" disabled>
                                                {selectedGrade && selectedClass ? 'No subjects found' : 'Select grade and class first'}
                                            </MenuItem>
                                        ) : (
                                            subjectOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))
                                        )}
                                    </TextField>
                                )}
                            />
                            <Controller
                                control={control}
                                name="selectedYear"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Academic Year"
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
                                    >
                                        {yearOptions.map((option) => (
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
                                                borderRadius: "10px",
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
                                        label="Search Students"
                                        placeholder="Search by name or admission number"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: 150,
                                            maxWidth: 460,
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

                        {/* Status indicators */}
                        {(modifiedCount > 0 || !isFormValid) && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                {modifiedCount > 0 && (
                                    <Chip 
                                        label={`${modifiedCount} marks modified`} 
                                        color="info" 
                                        size="small" 
                                        variant="outlined"
                                    />
                                )}
                                {!isFormValid && (
                                    <Chip 
                                        label="Complete required fields to enable submission" 
                                        color="warning" 
                                        size="small" 
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                                    Student Marks {filteredStudents.length > 0 && `(${filteredStudents.length} students)`}
                                </Typography>
                                {modifiedCount > 0 && (
                                    <Tooltip title="Number of students with modified marks">
                                        <Chip 
                                            label={`${modifiedCount} unsaved changes`}
                                            color="warning"
                                            size="small"
                                            variant="filled"
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                            
                            {filteredStudents.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {!selectedGrade || !selectedClass || !selectedYear ? 
                                            'Please select grade, class, and year to view students' : 
                                            searchQuery ? 'No students found matching your search criteria' :
                                            'No students found for the selected criteria'
                                        }
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ height: 400, width: '100%' }}>
                                    <DataGrid
                                        rows={filteredStudents}
                                        columns={columns}
                                        getRowId={(row) => row.id}
                                        processRowUpdate={processRowUpdate}
                                        onProcessRowUpdateError={(error) => {
                                            console.error('Row update error:', error);
                                            showSnackbar('Error updating student marks', 'error');
                                        }}
                                        initialState={{
                                            pagination: { paginationModel: { page: 0, pageSize: 10 } },
                                        }}
                                        pageSizeOptions={[5, 10, 25, 50]}
                                        disableRowSelectionOnClick
                                        loading={loading}
                                        sx={{
                                            '.MuiDataGrid-footerContainer': { 
                                                backgroundColor: theme.palette.background.paper, 
                                                color: theme.palette.text.secondary,
                                            },
                                            '.MuiDataGrid-row:nth-of-type(odd)': { 
                                                backgroundColor: theme.palette.background.paper,
                                            },
                                            '.MuiDataGrid-row:nth-of-type(even)': { 
                                                backgroundColor: theme.palette.background.paper,
                                            },
                                            '.MuiDataGrid-cell': { 
                                                borderColor: theme.palette.divider,
                                            },
                                            '.MuiDataGrid-virtualScrollerContent': { 
                                                '& .MuiDataGrid-row': { 
                                                    '&:hover': { 
                                                        backgroundColor: theme.palette.action.hover,
                                                    },
                                                },
                                            },
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: theme.shape.borderRadius,
                                        }}
                                    />
                                </Box>
                            )}
                            
                            {filteredStudents.length > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmitMarks}
                                        disabled={loading || !isFormValid || modifiedCount === 0}
                                        startIcon={<SaveIcon />}
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            '&:hover': { bgcolor: theme.palette.primary.dark },
                                            color: theme.palette.primary.contrastText,
                                            px: 4,
                                            py: 1.2,
                                            borderRadius: theme.shape.borderRadius,
                                            minWidth: 180,
                                        }}
                                    >
                                        {loading ? 'Submitting...' : `Submit ${modifiedCount} Marks`}
                                    </Button>
                                    
                                    {modifiedCount > 0 && (
                                        <Button
                                            variant="outlined"
                                            onClick={handleClearChanges}
                                            startIcon={<ClearIcon />}
                                            sx={{
                                                borderColor: theme.palette.warning.main,
                                                color: theme.palette.warning.main,
                                                '&:hover': {
                                                    borderColor: theme.palette.warning.dark,
                                                    color: theme.palette.warning.dark,
                                                },
                                                px: 3,
                                                py: 1.2,
                                                borderRadius: theme.shape.borderRadius,
                                            }}
                                        >
                                            Clear Changes
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    )}
                </Stack>
            </Box>

            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                    elevation={6}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherDashboard;