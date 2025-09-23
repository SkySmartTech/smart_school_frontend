import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Stack,
  AppBar,
  CssBaseline,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  InputAdornment,
  Tabs,
  Tab
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  type GridColDef,
  GridActionsCellItem,
  type GridRowId,
  type GridRowParams
} from "@mui/x-data-grid";
import {
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomTheme } from "../../context/ThemeContext";
import { type User, statusOptions, genderOptions, gradeOptions, mediumOptions, classOptions, subjectOptions } from "../../types/userManagementTypes";
import {
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  searchUsers,
  bulkDeactivateUsers,
  getUserRole
} from "../../api/userManagementApi";
import Navbar from "../../components/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import debounce from "lodash/debounce";

// Update UserCategory type
type UserCategory = 'Student' | 'Teacher' | 'Parent';

const UserManagement: React.FC = () => {
  const [form, setForm] = useState<Omit<User, 'id'> & { id?: number }>({
    name: "",
    username: "",
    email: "",
    userType: "Student",
    userRole: getUserRole("Student"),
    status: true,
    password: "",
    contact: "",
    // Optional fields with empty strings
    address: "",
    birthDay: "",
    gender: "",
    location: "",
    photo: "",
    // Role-specific fields
    grade: "",
    class: "",
    medium: "",
    subject: "",
    profession: "",
    studentAdmissionNo: "",
    // Additional form fields
    studentClass: "",
    teacherClass: [],
    studentGrade: "",
    teacherGrade: "",
    teacherGrades: [],
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowId[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<UserCategory>('Student');
  const theme = useTheme();
  const dataGridRef = useRef<any>(null);
  useCustomTheme();

  const queryClient = useQueryClient();

  const { data: allUsers = [], isLoading: isDataLoading, refetch } = useQuery<User[]>({
    queryKey: ["users", activeTab], // Add activeTab to query key so it refreshes on tab change
    queryFn: () => fetchUsers(activeTab), // Pass activeTab to fetchUsers
  });

  // Remove this line as we're now fetching filtered data directly from API
  // const users = allUsers.filter(user => user.userType === activeTab);
  const users = allUsers; // Use the data directly since it's already filtered by the API

  const { data: apiSearchResults = [], isLoading: isSearching, refetch: searchRefetch } = useQuery({
    queryKey: ["searchUsers", searchTerm, activeTab],
    queryFn: () => searchUsers(searchTerm, activeTab),
    enabled: false,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User created successfully!", "success");
      handleClear();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create user";
      const errors = error.response?.data?.errors;
      if (errors) {
        showSnackbar(Object.values(errors).flat().join(", "), "error");
      } else {
        showSnackbar(errorMessage, "error");
      }
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: User) => updateUser(userData.id as number, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User updated successfully!", "success");
      handleClear();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update user";
      const errors = error.response?.data?.errors;
      if (errors) {
        showSnackbar(Object.values(errors).flat().join(", "), "error");
      } else {
        showSnackbar(errorMessage, "error");
      }
    }
  });

  const deactivateUserMutation = useMutation({
    mutationFn: (id: number) => deactivateUser(id, activeTab),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User deactivated successfully!", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || "Failed to deactivate user", "error");
    }
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: (ids: number[]) => bulkDeactivateUsers(ids, activeTab),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar(`${rowSelectionModel.length} users deactivated successfully!`, "success");
      setRowSelectionModel([]);
    },
    onError: () => {
      showSnackbar("Error deactivating some users", "error");
    }
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ value: unknown }>, field: keyof User) => {
    const value = e.target.value;
    if (field === 'status') {
      setForm(prev => ({
        ...prev,
        [field]: value === 'true' || value === true
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    if (!form.name || !form.username || !form.email || (editId === null && !form.password)) {
      showSnackbar("Please fill all required fields!", "error");
      return;
    }

    const userData = {
      ...form,
      userType: activeTab
    };

    if (editId !== null) {
      updateUserMutation.mutate({ ...userData, id: editId });
    } else {
      createUserMutation.mutate(userData as User);
    }
  };

  const handleClear = () => {
    setForm({
      name: "",
      username: "",
      email: "",
      userType: activeTab,
      userRole: getUserRole(activeTab),
      status: true,
      password: "",
      contact: "",
      // Optional fields with empty strings
      address: "",
      birthDay: "",
      gender: "",
      location: "",
      photo: "",
      // Role-specific fields
      grade: "",
      class: "",
      medium: "",
      subject: "",
      profession: "",
      studentAdmissionNo: "",
      // Additional form fields
      studentClass: "",
      teacherClass: [],
      studentGrade: "",
      teacherGrade: "",
      teacherGrades: [],
    });
    setEditId(null);
  };

  const handleEdit = (id: number) => {
    const userToEdit = (searchTerm ? apiSearchResults : users).find(user => user.id === id);
    if (userToEdit) {
      setForm({ name: userToEdit.name || "",
      username: userToEdit.username || "",
      email: userToEdit.email || "",
      userType: userToEdit.userType,
      userRole: getUserRole(userToEdit.userType),
      status: userToEdit.status,
      password: "",
      contact: userToEdit.contact || "",
      address: userToEdit.address || "",
      birthDay: userToEdit.birthDay || "",
      gender: userToEdit.gender || "",
      location: userToEdit.location || "",
      photo: userToEdit.photo || "",
      // Only include fields that actually exist for this user type
      grade: userToEdit.grade || "",
      class: userToEdit.class || "",
      medium: userToEdit.medium || "",
      subject: userToEdit.subject || "",
      profession: userToEdit.profession || "",
      studentAdmissionNo: userToEdit.studentAdmissionNo || "",
      staffNo: userToEdit.staffNo || "",
      });
      setEditId(id);
    }
  };

  const handleDeactivate = (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      deactivateUserMutation.mutate(id);
    }
  };

  const handleBulkDeactivate = () => {
    if (rowSelectionModel.length === 0) {
      showSnackbar("Please select users to deactivate", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to deactivate ${rowSelectionModel.length} selected users?`)) {
      bulkDeactivateMutation.mutate(rowSelectionModel as number[]);
    }
  };

const handleExportPDF = () => {
  const doc = new jsPDF();
  const dataToExport = searchTerm ? apiSearchResults : users;
  
  const tableData = dataToExport.map(user => [
    user.name,
    user.username,
    user.email,
    user.address || '-',
    user.birthDay || '-',
    user.contact || '-', // Changed from gender to contact (phone number)
    user.gender || '-',
    activeTab === 'Student' ? user.grade || '-' : 
      activeTab === 'Teacher' ? user.class || '-' : user.profession || '-',
    activeTab === 'Student' ? user.medium || '-' : 
      activeTab === 'Teacher' ? user.subject || '-' : (user as any).parentNo || '-', // Safe access for parentNo
    user.status ? 'Active' : 'Inactive'
  ]);

  const headers = [
    'Name', 'Username', 'Email', 'Address', 'Birthday', 'Phone No', 'Gender',
    activeTab === 'Student' ? 'Grade' : activeTab === 'Teacher' ? 'Class' : 'Profession',
    activeTab === 'Student' ? 'Medium' : activeTab === 'Teacher' ? 'Subject' : 'Parent No',
    'Status'
  ];

  doc.text(`${activeTab} Management Report`, 14, 16);
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 20,
    styles: {
      cellPadding: 3,
      fontSize: 8,
      valign: 'middle',
      halign: 'center',
    },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(`${activeTab.toLowerCase()}-management-report.pdf`);
};

  const handleClearSearch = () => {
    setSearchTerm("");
  };

const handleTabChange = (_event: React.SyntheticEvent, newValue: UserCategory) => {
  setActiveTab(newValue);
  setForm(prev => ({
    ...prev,
    userType: newValue,
    userRole: getUserRole(newValue)
  }));
  setSearchTerm("");
};

  const debouncedSearch = useRef(
    debounce((term: string) => {
      if (term.trim() === "") {
        return;
      }
      searchRefetch();
    }, 500)
  ).current;

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const isMutating = createUserMutation.isPending ||
    updateUserMutation.isPending ||
    deactivateUserMutation.isPending ||
    bulkDeactivateMutation.isPending;

  const getColumns = (): GridColDef<User>[] => {
    const commonColumns: GridColDef<User>[] = [
      { field: 'name', headerName: 'Name', width: 150, flex: 1 },
      { field: 'username', headerName: 'Username', width: 120, flex: 1 },
      { field: 'email', headerName: 'Email', width: 180, flex: 1 },
      { field: 'address', headerName: 'Address', width: 150, flex: 1 },
      { field: 'birthDay', headerName: 'Birthday', width: 100, flex: 1 },
      { field: 'contact', headerName: 'Phone No', width: 120, flex: 1 },
      { field: 'gender', headerName: 'Gender', width: 100, flex: 1 },
    ];

    const statusColumn: GridColDef<User> = {
      field: 'status',
      headerName: 'Status',
      width: 120,
      flex: 1,
      type: 'boolean',
      renderCell: (params) => (
        <Box
          sx={{
            color: params.value ? theme.palette.success.main : theme.palette.error.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: params.value ? theme.palette.success.main : theme.palette.error.main
            }}
          />
          {params.value ? 'Active' : 'Inactive'}
        </Box>
      )
    };

    const actionColumn: GridColDef<User> = {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.id as number)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Deactivate"
          onClick={() => handleDeactivate(params.id as number)}
          showInMenu
        />,
      ],
    };

    switch (activeTab) {
      case 'Student':
        return [
          ...commonColumns,
          { field: 'grade', headerName: 'Grade', width: 100, flex: 1 },
          { field: 'medium', headerName: 'Medium', width: 100, flex: 1 },
          { field: 'class', headerName: 'Class', width: 100, flex: 1 },
          statusColumn,
          actionColumn
        ];
      case 'Teacher':
        return [
          ...commonColumns,
          { field: 'grade', headerName: 'Grade', width: 100, flex: 1 },
          { field: 'class', headerName: 'Class', width: 100, flex: 1 },
          { field: 'subject', headerName: 'Subject', width: 120, flex: 1 },
          { field: 'medium', headerName: 'Medium', width: 100, flex: 1 },
          statusColumn,
          actionColumn
        ];
      case 'Parent':
        return [
          ...commonColumns,
          { field: 'profession', headerName: 'Profession', width: 120, flex: 1 },
          { field: 'parentNo', headerName: 'Parent No', width: 120, flex: 1 },
          { field: 'studentAdmissionNo', headerName: 'Student Admission No', width: 150, flex: 1 },
          statusColumn,
          actionColumn
        ];
      default:
        return [...commonColumns, statusColumn, actionColumn];
    }
  };

  const columns = getColumns();

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export PDF">
            <IconButton onClick={handleExportPDF}>
              <PdfIcon />
            </IconButton>
          </Tooltip>
          {rowSelectionModel.length > 0 && (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDeactivate}
              size="small"
              sx={{ ml: 1 }}
            >
              Deactivate Selected
            </Button>
          )}
        </Box>
        <Box>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </Box>
      </GridToolbarContainer>
    );
  }

  const displayData = searchTerm ? apiSearchResults : users;

  const renderFormFields = () => {
    const commonFields = (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Name*"
          name="name"
          value={form.name}
          onChange={handleChange}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        />
        <TextField
          label="Username*"
          name="username"
          value={form.username}
          onChange={handleChange}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        />
        <TextField
          label="Email*"
          name="email"
          value={form.email}
          onChange={handleChange}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        />
        <TextField
          label="Address"
          name="address"
          value={form.address || ''}
          onChange={handleChange}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        />
        <TextField
          label="Birthday"
          type="date"
          name="birthDay"
          value={form.birthDay || ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        />
        <TextField
          label="Phone No"
          name="contact"
          value={form.contact || ''}
          onChange={handleChange}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        />
        <TextField
          select
          label="Gender"
          name="gender"
          value={form.gender || ''}
          onChange={(e) => handleSelectChange(e, "gender")}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        >
          {genderOptions.map((gender: string) => (
            <MenuItem key={gender} value={gender}>
              {gender}
            </MenuItem>
          ))}
        </TextField>
        {editId === null && (
          <TextField
            label="Password*"
            name="password"
            type="password"
            value={form.password || ''}
            onChange={handleChange}
            sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
            size="small"
          />
        )}
        <TextField
          select
          label="Status"
          name="status"
          value={form.status.toString()}
          onChange={(e) => handleSelectChange(e, "status")}
          sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
          size="small"
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.label} value={option.value.toString()}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    );

    switch (activeTab) {
      case 'Student':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {commonFields}
            <TextField
              select
              label="Grade"
              name="grade"
              value={form.grade || ''}
              onChange={(e) => handleSelectChange(e, "grade")}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            >
              {gradeOptions.map((grade: string) => (
                <MenuItem key={grade} value={grade}>
                  {grade}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Medium"
              name="medium"
              value={form.medium || ''}
              onChange={(e) => handleSelectChange(e, "medium")}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            >
              {mediumOptions.map((medium: string) => (
                <MenuItem key={medium} value={medium}>
                  {medium}
                </MenuItem>
              ))}
            </TextField>
             <TextField
              select
              label="Class"
              name="class"
              value={form.class || ''}
              onChange={(e) => handleSelectChange(e, "class")}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            >
              {classOptions.map((cls: string) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 'Teacher':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {commonFields}
            <TextField
              select
              label="Class"
              name="class"
              value={form.class || ''}
              onChange={(e) => handleSelectChange(e, "class")}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            >
              {classOptions.map((cls: string) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Subject"
              name="subject"
              value={form.subject || ''}
              onChange={(e) => handleSelectChange(e, "subject")}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            >
              {subjectOptions.map((subject: string) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Medium"
              name="medium"
              value={form.medium || ''}
              onChange={(e) => handleSelectChange(e, "medium")}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            >
              {mediumOptions.map((medium: string) => (
                <MenuItem key={medium} value={medium}>
                  {medium}
                </MenuItem>
              ))}
            </TextField>
              <TextField
              select
              label="Grade"
              name="grade"
              value={form.grade || ''}
              onChange={(e) => handleSelectChange(e, "grade")}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            >
              {gradeOptions.map((grade: string) => (
                <MenuItem key={grade} value={grade}>
                  {grade}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 'Parent':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {commonFields}
            <TextField
              label="Profession"
              name="profession"
              value={form.profession || ''}
              onChange={handleChange}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            />
            <TextField
              label="Parent No"
              name="parentNo"
              value={form.parentNo || ''}
              onChange={handleChange}
              sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 120 }}
              size="small"
            />
          </Box>
        );
      default:
        return commonFields;
    }
  };

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

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
            title="User Management"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Stack spacing={3} sx={{ p: 3, overflow: 'auto' }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
              {editId !== null ? "Edit User" : "Create New User"}
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {renderFormFields()}
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isMutating}
                  startIcon={isMutating ? <CircularProgress size={20} /> : null}
                  sx={{ minWidth: 150 }}
                >
                  {editId !== null ? "Update User" : "Create User"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isMutating}
                  sx={{ minWidth: 100 }}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2, height: 720 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                >
                  <Tab label="Students" value="Student" />
                  <Tab label="Teachers" value="Teacher" />
                  <Tab label="Parents" value="Parent" />
                </Tabs>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder={`Search ${activeTab.toLowerCase()}s...`}
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ 
                    width: 300,
                    '& .MuiOutlinedInput-root': {
                      pr: 1,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ visibility: searchTerm ? 'visible' : 'hidden' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Box>
            <DataGrid
              rows={displayData}
              columns={columns}
              loading={Boolean(isDataLoading || isMutating || (searchTerm && isSearching))}
              slots={{ toolbar: CustomToolbar }}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={(newSelection) => setRowSelectionModel([...newSelection])}
              pageSizeOptions={[5, 10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.background.paper,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: theme.spacing(1),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
              }}
              ref={dataGridRef}
            />
          </Paper>
        </Stack>

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
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default UserManagement;


