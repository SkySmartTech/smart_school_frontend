
import React, { useState } from "react";
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
    Alert} from "@mui/material";
import { DateRange, School, CalendarMonth } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchSummaryData } from "../../api/summaryApi";
import type { SummaryData } from "../../api/summaryApi";

const years = ["2020", "2021", "2022", "2023"];
const grades = ["A", "B", "C", "D"];
const terms = ["All Terms", "Term 1", "Term 2", "Term 3"];
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];


const Summary: React.FC = () => {
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [year, setYear] = useState<string>(years[0]);
    const [grade, setGrade] = useState<string>(grades[0]);
    const [term, setTerm] = useState<string>(terms[0]);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });
    const [] = useState('');


    const { data, isLoading, isError, error } = useQuery<SummaryData, Error>({
        queryKey: ["summary", year, grade, term],
        queryFn: () => fetchSummaryData(year, grade, term),
        retry: 1,
    });

    React.useEffect(() => {
        if (isError && error) {
            setSnackbar({ open: true, message: error.message || 'Error loading summary data', severity: 'error' });
        }
    }, [isError, error]);

    // Calculate averages for the table
    const calculateAverages = (tableData: any[] = []) => {
        if (!tableData.length) return { sinhala: '0', english: '0', maths: '0', science: '0', overall: '0' };
        const totals = { sinhala: 0, english: 0, maths: 0, science: 0 };
        tableData.forEach(row => {
            totals.sinhala += row.sinhala;
            totals.english += row.english;
            totals.maths += row.maths;
            totals.science += row.science;
        });
        const averages = {
            sinhala: (totals.sinhala / tableData.length).toFixed(1),
            english: (totals.english / tableData.length).toFixed(1),
            maths: (totals.maths / tableData.length).toFixed(1),
            science: (totals.science / tableData.length).toFixed(1),
            overall: ((totals.sinhala + totals.english + totals.maths + totals.science) / (tableData.length * 4)).toFixed(1)
        };
        return averages;
    };
    const averages = calculateAverages((data as SummaryData | undefined)?.tableData);

    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    return (
        <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
            <CssBaseline />
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" sx={{
                    boxShadow: "none",
                    bgcolor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary
                }}>
                    <Navbar title="Academic Summary" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </AppBar>
                <Stack spacing={3} sx={{ px: 4, py: 3 }}>
                    {/* Top Filters */}
                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Stack
                            direction="row"
                            spacing={3}
                            alignItems="center"
                            justifyContent="space-between"
                            flexWrap="wrap"
                            sx={{ width: '100%' }}
                        >
                            {/* Left side dropdowns */}
                            <Stack direction="row" spacing={20} flexWrap="wrap">
                                {/* Year */}
                                <Stack direction="column" spacing={1}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Year"
                                        variant="outlined"
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <DateRange color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "10px",
                                                height: "45px",
                                            },
                                            width: 150,
                                        }}
                                    >
                                        {years.map((y) => (
                                            <MenuItem key={y} value={y}>
                                                {y}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>

                                {/* Grade */}
                                <Stack direction="column" spacing={1}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Student Grade"
                                        variant="outlined"
                                        value={grade}
                                        onChange={e => setGrade(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <School color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "10px",
                                                height: "45px",
                                            },
                                            width: 150,
                                        }}
                                    >
                                        {grades.map((g) => (
                                            <MenuItem key={g} value={g}>
                                                {g}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>

                                {/* Term */}
                                <Stack direction="column" spacing={1}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Exam"
                                        variant="outlined"
                                        value={term}
                                        onChange={e => setTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarMonth color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "10px",
                                                height: "45px",
                                            },
                                            width: 150,
                                        }}
                                    >
                                        {terms.map((t) => (
                                            <MenuItem key={t} value={t}>
                                                {t}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                            </Stack>                         
                        </Stack>

                    </Paper>
                    {/* Charts Section */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
                        <Paper elevation={2} sx={{ p: 3, minWidth: 300, flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>Subject Distribution</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                                    <PieChart>
                                        <Pie
                                            data={(data as SummaryData | undefined)?.subjectData || []}
                                            dataKey="value"
                                            outerRadius={80}
                                            label={({ name, percent }: { name: string; percent?: number }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {((data as SummaryData | undefined)?.subjectData || []).map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                                        <Legend />
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </Paper>
                        <Paper elevation={2} sx={{ p: 3, minWidth: 400, flex: 2 }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>Class Performance</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}><CircularProgress /></Box> : (
                                    <BarChart data={(data as SummaryData | undefined)?.classData || []}>
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <RechartsTooltip formatter={(value: number) => [`${value}%`, 'Average Marks']} />
                                        <Legend />
                                        <Bar dataKey="marks" name="Average Marks" fill="#42A5F5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </Paper>
                    </Stack>
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
                                            <TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell>
                                        </TableRow>
                                    ) : ((data as SummaryData | undefined)?.tableData || []).map((row: any, idx: number) => (
                                        <TableRow key={idx} hover>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{row.class}</TableCell>
                                            <TableCell align="right">{row.sinhala}</TableCell>
                                            <TableCell align="right">{row.english}</TableCell>
                                            <TableCell align="right">{row.maths}</TableCell>
                                            <TableCell align="right">{row.sinhala + row.english + row.maths }</TableCell>
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
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Summary;