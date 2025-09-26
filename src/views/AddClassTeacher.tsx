import { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  CssBaseline,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { useCustomTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import { fetchTeachers, assignClassTeacher, type Teacher } from "../api/teacherApi";

// Hardcoded class names for each grade
const CLASS_NAMES = ["Araliya", "Olu", "Nelum", "Rosa", "Manel", "Sooriya", "Kumudu"];
const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

interface ClassTeacherData {
  grade: string;
  classes: {
    className: string;
    teacherId: string;
    teacherName: string;
    staffNo: string;
    isEditing: boolean;
  }[];
}

interface PopupFormData {
  searchTerm: string;
  selectedGrade: string;
  teachers: Teacher[];
}

const AddClassTeacher = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [classTeachers, setClassTeachers] = useState<ClassTeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Popup states
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<{grade: string; className: string; teacherId: string} | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupFormData, setPopupFormData] = useState<PopupFormData>({
    searchTerm: "",
    selectedGrade: "",
    teachers: []
  });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const theme = useTheme();
  useCustomTheme();

  // Initialize class teachers data
  useEffect(() => {
    const initializeClassTeachers = () => {
      const initialData: ClassTeacherData[] = GRADES.map(grade => ({
        grade,
        classes: CLASS_NAMES.map(className => ({
          className,
          teacherId: "",
          teacherName: "Not assigned",
          staffNo: "",
          isEditing: false
        }))
      }));
      setClassTeachers(initialData);
      setLoading(false);
    };

    initializeClassTeachers();
  }, []);

  const handleOpenPopup = (grade: string, className: string, teacherId: string) => {
    setCurrentClass({ grade, className, teacherId });
    setPopupFormData({
      searchTerm: "",
      selectedGrade: grade.replace("Grade ", ""),
      teachers: []
    });
    setSelectedTeacher(null);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setCurrentClass(null);
    setPopupFormData({
      searchTerm: "",
      selectedGrade: "",
      teachers: []
    });
    setSelectedTeacher(null);
  };

  const handleSearch = async () => {
    try {
      setPopupLoading(true);
      const searchedTeachers = await fetchTeachers({
        search: popupFormData.searchTerm,
        grade: popupFormData.selectedGrade
      });
      setPopupFormData(prev => ({
        ...prev,
        teachers: searchedTeachers
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search teachers");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedTeacher || !currentClass) {
      setError("Please select a teacher");
      return;
    }

    try {
      setPopupLoading(true);
      
      const assignment = {
        grade: currentClass.grade.replace("Grade ", ""),
        class: currentClass.className,
        teacherId: selectedTeacher.id,
        staffNo: selectedTeacher.staffNo,
        teacherName: selectedTeacher.name
      };

      const result = await assignClassTeacher(assignment);
      
      if (result.success) {
        // Update local state
        setClassTeachers(prev => prev.map(gradeData => {
          if (gradeData.grade === currentClass.grade) {
            return {
              ...gradeData,
              classes: gradeData.classes.map(classData => {
                if (classData.className === currentClass.className) {
                  return {
                    ...classData,
                    teacherId: selectedTeacher.id,
                    teacherName: selectedTeacher.name,
                    staffNo: selectedTeacher.staffNo,
                    isEditing: false
                  };
                }
                return classData;
              })
            };
          }
          return gradeData;
        }));

        setSuccess(result.message);
        handleClosePopup();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save assignment");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleSave = (grade: string, className: string) => {
    // Find the current assignment
    const gradeData = classTeachers.find(g => g.grade === grade);
    const classData = gradeData?.classes.find(c => c.className === className);
    
    if (!classData || !classData.teacherId) {
      setError("Please assign a teacher before saving");
      return;
    }

    // Update the state to mark as not editing
    setClassTeachers(prev => prev.map(g => {
      if (g.grade === grade) {
        return {
          ...g,
          classes: g.classes.map(c => {
            if (c.className === className) {
              return { ...c, isEditing: false };
            }
            return c;
          })
        };
      }
      return g;
    }));

    setSuccess(`Teacher assigned to ${className} successfully`);
  };

  const handleEdit = (grade: string, className: string) => {
    const gradeData = classTeachers.find(g => g.grade === grade);
    const classData = gradeData?.classes.find(c => c.className === className);
    
    if (classData) {
      handleOpenPopup(grade, className, classData.teacherId);
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", width: "100vw", height: "100vh", bgcolor: theme.palette.background.default }}>
        <CssBaseline />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
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
            title="Class Teachers Management"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Box sx={{ p: 3, flexGrow: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.action.hover }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.action.hover }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.action.hover }}>Class Teacher</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.action.hover }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classTeachers.map((gradeData, gradeIndex) =>
                  gradeData.classes.map((classData, classIndex) => (
                    <TableRow key={`${gradeIndex}-${classIndex}`}>
                      <TableCell>
                        {classIndex === 0 && (
                          <Typography variant="subtitle1" fontWeight="bold">
                            {gradeData.grade}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{classData.className}</TableCell>
                      <TableCell>
                        <Typography>
                          {classData.teacherName}
                          {classData.staffNo && ` (${classData.staffNo})`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEdit(gradeData.grade, classData.className)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSave(gradeData.grade, classData.className)}
                            disabled={!classData.teacherId}
                          >
                            Save
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Popup Dialog */}
        <Dialog 
          open={popupOpen} 
          onClose={handleClosePopup}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Assign Class Teacher - {currentClass?.grade} - {currentClass?.className}
              </Typography>
              <IconButton onClick={handleClosePopup}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            {/* Search and Filter Section */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 2 }}>
              <TextField
                placeholder="Search teachers by name or staff no..."
                value={popupFormData.searchTerm}
                onChange={(e) => setPopupFormData(prev => ({
                  ...prev,
                  searchTerm: e.target.value
                }))}
                sx={{ flex: 1 }}
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Grade</InputLabel>
                <Select
                  value={popupFormData.selectedGrade}
                  label="Grade"
                  onChange={(e) => setPopupFormData(prev => ({
                    ...prev,
                    selectedGrade: e.target.value
                  }))}
                >
                  <MenuItem value="">All Grades</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(grade => (
                    <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={handleSearch}
                startIcon={<Search />}
                disabled={popupLoading}
              >
                Search
              </Button>
            </Box>

            {/* Teachers Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Staff No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {popupFormData.teachers.map((teacher) => (
                    <TableRow 
                      key={teacher.id}
                      onClick={() => setSelectedTeacher(teacher)}
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedTeacher?.id === teacher.id ? theme.palette.action.selected : 'inherit',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell>{teacher.staffNo}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.grade || 'Not assigned'}</TableCell>
                      <TableCell>{teacher.class || 'Not assigned'}</TableCell>
                    </TableRow>
                  ))}
                  {popupFormData.teachers.length === 0 && !popupLoading && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="textSecondary">
                          No teachers found. Try searching with different criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {popupLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Selected Teacher Preview */}
            {selectedTeacher && (
              <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.success.light, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Teacher:
                </Typography>
                <Typography>
                  <strong>Name:</strong> {selectedTeacher.name}
                </Typography>
                <Typography>
                  <strong>Staff No:</strong> {selectedTeacher.staffNo}
                </Typography>
                <Typography>
                  <strong>Current Grade:</strong> {selectedTeacher.grade || 'Not assigned'}
                </Typography>
                <Typography>
                  <strong>Current Class:</strong> {selectedTeacher.class || 'Not assigned'}
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClosePopup} disabled={popupLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAssignment} 
              variant="contained"
              disabled={popupLoading || !selectedTeacher}
            >
              {popupLoading ? <CircularProgress size={24} /> : "Assign Teacher"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AddClassTeacher;