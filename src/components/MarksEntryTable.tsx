// src/components/MarksEntryTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';

interface StudentMark {
  admissionNo: string;
  studentName: string;
  term: string;
  marks: string; // Storing as string to allow empty or partial input
}

interface MarksEntryTableProps {
  students: StudentMark[];
  onMarksChange: (index: number, value: string) => void;
  onSubmit: () => void;
}

const MarksEntryTable: React.FC<MarksEntryTableProps> = ({ students, onMarksChange, onSubmit }) => {
  return (
    <Paper sx={{ mt: 3, p: 2, borderRadius: '8px', boxShadow: 3, bgcolor: 'white' }}>
      <Typography variant="h6" align="center" sx={{ mb: 2, color: '#0B2347' }}>
        Add Marks
      </Typography>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="marks entry table">
          <TableHead>
            <TableRow sx={{ bgcolor: '#C5D8F0' }}> {/* Light blue header */}
              <TableCell sx={{ fontWeight: 'bold', color: '#0B2347' }}>Admission NO</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B2347' }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B2347' }}>Term</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B2347' }}>Marks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow
                key={student.admissionNo} // Assuming admissionNo is unique for key
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: '#F0F5F9' }, // Lighter background for odd rows
                  '&:nth-of-type(even)': { bgcolor: 'white' }, // White background for even rows
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell component="th" scope="row">
                  {student.admissionNo}
                </TableCell>
                <TableCell>{student.studentName}</TableCell>
                <TableCell>{student.term}</TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={student.marks}
                    onChange={(e) => onMarksChange(index, e.target.value)}
                    inputProps={{ style: { textAlign: 'center' } }}
                    sx={{ width: '80px', '.MuiOutlinedInput-notchedOutline': { borderColor: '#A9A9A9' } }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#0B2347', // Dark blue background
            '&:hover': {
              bgcolor: '#081A33', // Slightly darker on hover
            },
            color: 'white', // White text
            px: 5,
            py: 1.2,
            borderRadius: '8px',
          }}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default MarksEntryTable;