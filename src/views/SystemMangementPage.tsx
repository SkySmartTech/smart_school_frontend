import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  CssBaseline,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  useTheme,
  Select,
  InputLabel,
  FormControl,
  type SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Sidebar from "../components/Sidebar";
import { useCustomTheme } from '../context/ThemeContext';
import {
  fetchGrades,
  fetchSubjects,
  fetchClasses,
  fetchCommonSettings,
  createSchool, 
  createGrade,
  createSubject,
  createClass,
  createCommonSetting,
  updateSchool, 
  updateGrade,
  updateSubject,
  updateClass,
  updateCommonSetting,
  deleteSchool, 
  deleteGrade,
  deleteSubject,
  deleteClass,
  deleteCommonSetting
} from '../api/systemManagementApi';
import Navbar from '../components/Navbar';

const SystemManagement = () => {
  // Start at Tab 0 (Grades)
  const [activeTab, setActiveTab] = useState(0); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [loading, setLoading] = useState({
    table: false,
    form: false,
    delete: false,
    options: false
  });
  const theme = useTheme();
  useCustomTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Data states
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [commonSettings, setCommonSettings] = useState<any[]>([]);

  // Form states
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editId, setEditId] = useState<number | null>(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, table: true }));
        // Tab indexes are now 0, 1, 2, 3
        switch (activeTab) {
          case 0: // Grades
            const gradesData = await fetchGrades();
            setGrades(gradesData);
            break;
          case 1: // Subjects
            const subjectsData = await fetchSubjects();
            setSubjects(subjectsData);
            break;
          case 2: // Classes
            const classesData = await fetchClasses();
            setClasses(classesData);
            break;
          case 3: // Common Settings
            const commonSettingsData = await fetchCommonSettings();
            setCommonSettings(commonSettingsData);
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Failed to load data', 'error');
      } finally {
        setLoading(prev => ({ ...prev, table: false }));
      }
    };

    fetchData();
  }, [activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddClick = () => {
    // Reset formData
    setFormData({});
    setFieldErrors({});
    setEditId(null);
    setOpenForm(true);
  };

  const handleEditClick = (item: any) => {
    // Copy item data for editing. Since Grade ID is API-specific, we don't need it on the form.
    setFormData({ ...item }); 
    setFieldErrors({});
    setEditId(item.id);
    setOpenForm(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      // NOTE: Tab indexes are 0, 1, 2, 3
      switch (activeTab) {
        case 0: await deleteGrade(id); break; 
        case 1: await deleteSubject(id); break; 
        case 2: await deleteClass(id); break; 
        case 3: await deleteCommonSetting(id); break; 
        default: await deleteSchool(id); break; // Fallback
      }
      showSnackbar('Item deleted successfully', 'success');

      // Refresh data
      switch (activeTab) {
        case 0: setGrades(await fetchGrades()); break;
        case 1: setSubjects(await fetchSubjects()); break;
        case 2: setClasses(await fetchClasses()); break;
        case 3: setCommonSettings(await fetchCommonSettings()); break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showSnackbar('Failed to delete item', 'error');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      setFieldErrors({});

      if (editId) {
        // Update existing item
        // NOTE: Tab indexes are 0, 1, 2, 3
        switch (activeTab) {
          case 0: await updateGrade(editId, formData); break; 
          case 1: await updateSubject(editId, formData); break; 
          case 2: await updateClass(editId, formData); break; 
          case 3: await updateCommonSetting(editId, formData); break; 
          default: await updateSchool(editId, formData); break; // Fallback
        }
      } else {
        // Create new item
        // NOTE: The createGrade API endpoint requires both 'grade' and 'gradeId'. 
        // We ensure formData contains both if we are creating.
        switch (activeTab) {
          case 0: 
                if (!formData.gradeId) {
                    setFieldErrors(prev => ({ ...prev, gradeId: "Grade ID is required for new grades." }));
                    throw new Error("Validation Failed");
                }
                await createGrade(formData); 
                break; 
          case 1: await createSubject(formData); break; 
          case 2: await createClass(formData); break; 
          case 3: await createCommonSetting(formData); break; 
          default: await createSchool(formData); break; // Fallback
        }
      }

      showSnackbar(`Item ${editId ? 'updated' : 'added'} successfully`, 'success');
      setOpenForm(false);

      // Refresh data
      switch (activeTab) {
        case 0: setGrades(await fetchGrades()); break;
        case 1: setSubjects(await fetchSubjects()); break;
        case 2: setClasses(await fetchClasses()); break;
        case 3: setCommonSettings(await fetchCommonSettings()); break;
      }
    } catch (error: any) {
      console.error('Error saving data:', error);

      if (error.message === "Validation Failed") {
            showSnackbar('Please fill out all required fields.', 'error');
      } else if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setFieldErrors(error.response.data.errors);
        } else if (error.response.data.message) {
          showSnackbar(error.response.data.message, 'error');
        }
      } else {
        showSnackbar(`Failed to ${editId ? 'update' : 'add'} item`, 'error');
      }
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderTable = () => {
    // NOTE: Tab indexes start at 0 (Grades)
    switch (activeTab) {
      case 0: // Grades
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* REMOVED GRADE ID COLUMN FROM TABLE */}
                  <TableCell>Grade Name</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    {/* REMOVED GRADE ID CELL */}
                    <TableCell>{grade.grade}</TableCell> 
                    <TableCell>{grade.updated_at}</TableCell>
                    <TableCell>{grade.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(grade)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(grade.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 1: // Subjects
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject Name</TableCell>
                  <TableCell>Medium</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.subjectName}</TableCell>
                    <TableCell>{subject.medium}</TableCell>
                    <TableCell>{subject.updated_at}</TableCell>
                    <TableCell>{subject.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(subject)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(subject.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 2: // Classes
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.class}</TableCell> 
                    <TableCell>{cls.grade}</TableCell> 
                    <TableCell>{cls.updated_at}</TableCell>
                    <TableCell>{cls.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(cls)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(cls.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 3: // Common Setting
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Setting Name</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commonSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>{setting.settingName}</TableCell>
                    <TableCell>{setting.value}</TableCell>
                    <TableCell>{setting.updated_at}</TableCell>
                    <TableCell>{setting.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(setting)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(setting.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };

  const renderForm = () => {
    // NOTE: Tab indexes start at 0 (Grades)
    switch (activeTab) {
      case 0: // Grades
        return (
          <>
              {/* Conditional Grade ID field: Visible only for ADD (editId is null) */}
              {!editId && (
                <TextField
                  fullWidth
                  label="Grade ID (Required for creation)"
                  name="gradeId" 
                  value={formData.gradeId || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  error={!!fieldErrors.gradeId}
                  helperText={fieldErrors.gradeId}
                />
              )}
              
            <TextField
              fullWidth
              label="Grade Name"
              name="grade" 
              value={formData.grade || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.grade}
              helperText={fieldErrors.grade}
            />
          </>
        );
      case 1: // Subjects
        return (
          <>
              <TextField
              fullWidth
              label="Subject Name"
              name="subjectName"
              value={formData.subjectName || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.subjectName}
              helperText={fieldErrors.subjectName}
            />
              {/* Added 'Medium' field for database validation */}
              <TextField
              fullWidth
              label="Medium"
              name="medium" 
              value={formData.medium || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.medium}
              helperText={fieldErrors.medium}
            />
          </>
        );
      case 2: // Classes
        return (
          <>
            <TextField
              fullWidth
              label="Class Name"
              name="class"
              value={formData.class || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.class}
              helperText={fieldErrors.class}
            />
            {/* Dropdown for grades */}
            <FormControl fullWidth margin="normal" error={!!fieldErrors.grade}>
              <InputLabel>Grade</InputLabel>
              <Select
                name="grade"
                value={formData.grade || ''}
                label="Grade"
                onChange={handleSelectChange}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.grade}>
                    {grade.grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      case 3: // Common Settings
        return (
          <>
            <TextField
              fullWidth
              label="Setting Name"
              name="settingName"
              value={formData.settingName || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.settingName}
              helperText={fieldErrors.settingName}
            />
            <TextField
              fullWidth
              label="Value"
              name="value"
              value={formData.value || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.value}
              helperText={fieldErrors.value}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
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
            title="System Management"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>
        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="system management tabs">
              <Tab label="Grades" />
              <Tab label="Subjects" />
              <Tab label="Classes" />
              <Tab label="Common Setting" />
            </Tabs>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              disabled={loading.table}
            >
              Add Data
            </Button>
          </Box>
          {loading.table ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            renderTable()
          )}
        </Box>
      </Box>
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={loading.form}
            startIcon={loading.form ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading.form ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemManagement;