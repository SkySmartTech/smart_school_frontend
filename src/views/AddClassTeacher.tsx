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
import { fetchTeachers, fetchTeachersByGradeAndClass, assignClassTeacher, deleteClassTeacher, getAllClassTeachers, type Teacher } from "../api/teacherApi";

// Note: removed import of global `classOptions` — we'll compute class list per grade from API data

interface ClassTeacherData {
  grade: string;
  classes: {
    className: string;
    teacherId: string;
    teacherName: string;
    staffNo: string;
    isEditing: boolean;
    assignmentId?: number | string; // track backend record id for delete
  }[];
}

interface PopupFormData {
  searchTerm: string;
  selectedGrade: string;
  selectedClass: string;
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
    selectedClass: "",
    teachers: []
  });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false); // loading flag for delete action

  const theme = useTheme();
  useCustomTheme();

  // Refresh helper to (re)load assignments from server and update state
  const refreshClassTeachers = async () => {
    try {
      setLoading(true);
      const assignments = await getAllClassTeachers();
      const grouped = assignments.reduce<Record<string, ClassTeacherData["classes"]>>((acc, item) => {
        const grade = item.grade || "Unknown";
        if (!acc[grade]) acc[grade] = [];
        acc[grade].push({
          className: item.className,
          teacherId: item.teacherId || "",
          teacherName: item.teacherName || "Not assigned",
          staffNo: item.staffNo || "",
          isEditing: false,
          assignmentId: item.id
        });
        return acc;
      }, {});

      const initialData: ClassTeacherData[] = Object.keys(grouped).map(grade => ({
        grade,
        classes: grouped[grade]
      }));

      setClassTeachers(initialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load class teachers");
    } finally {
      setLoading(false);
    }
  };

  // Load assignments on mount
  useEffect(() => {
    void refreshClassTeachers();
  }, []);

  // Get classes for a grade (derived from fetched classTeachers)
  const getClassesForGrade = (grade: string) => {
    const gd = classTeachers.find(g => g.grade === grade);
    return gd ? gd.classes.map(c => c.className) : [];
  };

  // Make handleOpenPopup async so we can prefetch teachers for the selected grade+class
  const handleOpenPopup = async (grade: string, className: string, teacherId: string) => {
    setCurrentClass({ grade, className, teacherId });
    setPopupFormData({
      searchTerm: "",
      selectedGrade: grade, 
      selectedClass: className,
      teachers: []
    });
    setSelectedTeacher(null);
    setPopupOpen(true);

    // Pre-fetch teachers for this grade+class so table shows only relevant teachers by default
    try {
      setPopupLoading(true);
      const searchedTeachers = await fetchTeachersByGradeAndClass(grade, className);
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

  const handleClosePopup = () => {
    setPopupOpen(false);
    setCurrentClass(null);
    setPopupFormData({
      searchTerm: "",
      selectedGrade: "",
      selectedClass: "",
      teachers: []
    });
    setSelectedTeacher(null);
  };

  const handleSearch = async () => {
    try {
      setPopupLoading(true);

      let searchedTeachers: Teacher[] = [];
      if (popupFormData.selectedGrade && popupFormData.selectedClass) {
        // call specific endpoint
        searchedTeachers = await fetchTeachersByGradeAndClass(popupFormData.selectedGrade, popupFormData.selectedClass);
      } else {
        // fallback to general teacher search endpoint with optional grade filter
        searchedTeachers = await fetchTeachers({
          search: popupFormData.searchTerm,
          grade: popupFormData.selectedGrade || undefined
        });
      }

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

  // auto-select first class when grade changes (auto-fill Class)
  const onGradeChange = (newGrade: string) => {
    const classes = getClassesForGrade(newGrade);
    setPopupFormData(prev => ({
      ...prev,
      selectedGrade: newGrade,
      selectedClass: classes.length > 0 ? classes[0] : ""
    }));

    if (classes.length > 0) {
      void (async () => {
        try {
          setPopupLoading(true);
          const t = await fetchTeachersByGradeAndClass(newGrade, classes[0]);
          setPopupFormData(prev => ({ ...prev, teachers: t }));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch teachers for selected grade/class");
        } finally {
          setPopupLoading(false);
        }
      })();
    } else {
      setPopupFormData(prev => ({ ...prev, teachers: [] }));
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
        // keep the original fields the backend may expect
        grade: currentClass.grade,                // e.g. "Grade 10"
        class: currentClass.className,            // e.g. "Olu"
        teacherId: selectedTeacher.id,            // mapped id (prefer inner teacher id)
        staffNo: selectedTeacher.staffNo,
        teacherName: selectedTeacher.name,

        // add validation fields your backend requires:
        teacherGrade: selectedTeacher.grade || currentClass.grade,
        teacherClass: selectedTeacher.class || currentClass.className,
        name: selectedTeacher.name
      };

      const result = await assignClassTeacher(assignment);
      
      if (result.success) {
        // refresh full assignments list from server so UI stays consistent and assignmentIds appear
        await refreshClassTeachers();
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

  const handleSave = async (grade: string, className: string) => {
    // This local save just toggles editing; ensure we refresh so other changes are reflected
    const gradeData = classTeachers.find(g => g.grade === grade);
    const classData = gradeData?.classes.find(c => c.className === className);
    
    if (!classData || !classData.teacherId) {
      setError("Please assign a teacher before saving");
      return;
    }

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

    // refresh to reflect any server-side state changes
    await refreshClassTeachers();
    setSuccess(`Teacher assigned to ${className} successfully`);
  };

  const handleEdit = (grade: string, className: string) => {
    const gradeData = classTeachers.find(g => g.grade === grade);
    const classData = gradeData?.classes.find(c => c.className === className);
    
    if (classData) {
      void handleOpenPopup(grade, className, classData.teacherId);
    }
  };

  // Delete handler
  const handleDelete = async (grade: string, className: string, assignmentId?: number | string) => {
    if (!assignmentId) {
      setError("No assignment ID available to delete.");
      return;
    }

    const confirmed = window.confirm(`Delete class teacher assignment for ${grade} / ${className}?`);
    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      const result = await deleteClassTeacher(assignmentId);
      if (result.success) {
        // refresh assignments so UI stays in sync
        await refreshClassTeachers();
        setSuccess(result.message);
      } else {
        setError(result.message || "Failed to delete assignment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assignment");
    } finally {
      setDeleteLoading(false);
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

  // Compose grade options from the fetched data
  const gradeOptions = classTeachers.map(g => g.grade);

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
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.action.hover }}>Class Teacher | Staff No</TableCell>
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
                          {classData.staffNo &&  ` (${classData.staffNo})`}
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
                            onClick={() => void handleSave(gradeData.grade, classData.className)}
                            disabled={!classData.teacherId}
                          >
                            Save
                          </Button>

                          {/* Delete button: enabled only if we have an assignmentId */}
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => void handleDelete(gradeData.grade, classData.className, classData.assignmentId)}
                            disabled={!classData.assignmentId || deleteLoading}
                            sx={{ ml: 1 }}
                          >
                            {deleteLoading ? <CircularProgress size={18} /> : "Delete"}
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
              
              <FormControl sx={{ minWidth: 160 }} size="small">
                <InputLabel>Grade</InputLabel>
                <Select
                  value={popupFormData.selectedGrade}
                  label="Grade"
                  onChange={(e) => onGradeChange(e.target.value as string)}
                >
                  <MenuItem value="">All Grades</MenuItem>
                  {gradeOptions.map(grade => (
                    <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 160 }} size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={popupFormData.selectedClass}
                  label="Class"
                  onChange={(e) => setPopupFormData(prev => ({ ...prev, selectedClass: e.target.value as string }))}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {getClassesForGrade(popupFormData.selectedGrade).map(cls => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
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