import React from "react";
import {
    Box,
    CssBaseline,
    AppBar,
    Stack,
    Typography,
    Paper,
    Select,
    MenuItem,
    InputBase,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

const subjectData = [
    { name: "Sinhala", value: 25 },
    { name: "English", value: 25 },
    { name: "Maths", value: 25 },
    { name: "Science", value: 25 },
];

const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];

const classData = [
    { name: "Class A", marks: 98 },
    { name: "Class B", marks: 55 },
    { name: "Class C", marks: 85 },
    { name: "Class D", marks: 88 },
    { name: "Class E", marks: 40 },
];

const tableData = [
    { class: "A", sinhala: 85, english: 78, maths: 92, science: 88 },
    { class: "B", sinhala: 72, english: 85, maths: 78, science: 80 },
    { class: "C", sinhala: 90, english: 82, maths: 88, science: 85 },
    { class: "D", sinhala: 78, english: 75, maths: 82, science: 79 },
    { class: "E", sinhala: 65, english: 70, maths: 68, science: 72 },
];

const Summary: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [] = React.useState("2025");
    const [] = React.useState("07");
    const [term, setTerm] = React.useState("ALL");
    const theme = useTheme();

    // Calculate totals and averages for the table
    const calculateTotals = () => {
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

        return { totals, averages };
    };

    const { averages } = calculateTotals();

    return (
        <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh", bgcolor: theme.palette.background.paper }}>
            <CssBaseline />
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" sx={{  borderBottom: "1px solid #ddd", boxShadow: "none" }}>
                    <Navbar title="Academic Summary" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </AppBar>

                <Stack spacing={3} sx={{ px: 4, py: 3 }}>
                    {/* Top Filters */}
                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography fontWeight={600}>Year</Typography>
                                <Select
                                    size="small"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    sx={{ width: 120 , borderRadius: 5}}
                                >
                                    <MenuItem value="ALL">2020</MenuItem>
                                    <MenuItem value="1">2021</MenuItem>
                                    <MenuItem value="2">2022</MenuItem>
                                    <MenuItem value="3">2023</MenuItem>
                                </Select>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography fontWeight={600}>Grade</Typography>
                                <Select
                                    size="small"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    sx={{ width: 120, borderRadius: 3 }}
                                >
                                    <MenuItem value="ALL">A</MenuItem>
                                    <MenuItem value="1">B</MenuItem>
                                    <MenuItem value="2">C</MenuItem>
                                    <MenuItem value="3">D</MenuItem>
                                </Select>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography fontWeight={600}>Term</Typography>
                                <Select
                                    size="small"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    sx={{ width: 120,borderRadius: 3 }}
                                >
                                    <MenuItem value="ALL">All Terms</MenuItem>
                                    <MenuItem value="1">Term 1</MenuItem>
                                    <MenuItem value="2">Term 2</MenuItem>
                                    <MenuItem value="3">Term 3</MenuItem>
                                </Select>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, maxWidth: 300, height:45 , border: `1px solid ${theme.palette.divider}`, borderRadius: 5, px: 1 }}>
                                <Search color="action" />
                                <InputBase
                                    fullWidth
                                    placeholder="Search classes or subjects..."
                                    sx={{ ml: 1  }}
                                />
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Charts Section */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} flexWrap="wrap">
                        <Paper elevation={2} sx={{ p: 3, minWidth: 300, flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>Subject Distribution</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={subjectData}
                                        dataKey="value"
                                        outerRadius={80}
                                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {subjectData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number) => [`${value}%`, 'Percentage']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>

                        <Paper elevation={2} sx={{ p: 3, minWidth: 400, flex: 2 }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>Class Performance</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={classData}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <RechartsTooltip
                                        formatter={(value: number) => [`${value}%`, 'Average Marks']}
                                    />
                                    <Legend />
                                    <Bar dataKey="marks" name="Average Marks" fill="#42A5F5" radius={[4, 4, 0, 0]} />
                                </BarChart>
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
                                        <TableCell align="right">Science</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                        <TableCell align="right">Average</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.map((row, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{row.class}</TableCell>
                                            <TableCell align="right">{row.sinhala}</TableCell>
                                            <TableCell align="right">{row.english}</TableCell>
                                            <TableCell align="right">{row.maths}</TableCell>
                                            <TableCell align="right">{row.science}</TableCell>
                                            <TableCell align="right">{row.sinhala + row.english + row.maths + row.science}</TableCell>
                                            <TableCell align="right">
                                                {((row.sinhala + row.english + row.maths + row.science) / 4).toFixed(1)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Average</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{averages.sinhala}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{averages.english}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{averages.maths}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{averages.science}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {(
                                                parseFloat(averages.sinhala) +
                                                parseFloat(averages.english) +
                                                parseFloat(averages.maths) +
                                                parseFloat(averages.science)
                                            ).toFixed(1)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{averages.overall}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Stack>

                <Footer />
            </Box>
        </Box>
    );
};

export default Summary;