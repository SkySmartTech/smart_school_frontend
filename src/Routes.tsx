import React, { Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import { useCurrentUser } from "./hooks/useCurrentUser";
import ClassTeacherReport from "./views/Reports/ClassTeacherReport";
import HelpPage from "./views/HelpPage";
import TeacherDashboard from "./views/Dashboard/TeacherDashboard";
import CommonDashboard from "./views/Dashboard/CommonDashboard";
import ManagementStaff from "./views/Reports/ManagementStaffReport";
import UserAccessManagementSystem from "./views/UserAccessManagementSystem";
import UnderDevelopmentPage from "./views/UnderDevelopmentPage";
// import StudentDashboard from "./views/Dashboard/StudentDashboard";

// import { useCurrentUser } from "./hooks/useCurrentUser";



// Public pages
const LoginPage = React.lazy(() => import("./views/LoginPage/Login"));
const RegistrationPage = React.lazy(() => import("./views/RegistrationPage/Register"));

// Dashboard pages
const AddMarks = React.lazy(() => import("./views/Dashboard/AddMarks"));
//const StudentDashboard = React.lazy(() => import("./views/Dashboard/StudentDashboard"));
// const ProductionUpdatePage = React.lazy(() => import("./views/Dashboard/ProductionUpdatePage"));
const SystemManagementPage = React.lazy(() => import("./views/SystemMangementPage"));
const UserProfile = React.lazy(() => import("./views/UserProfile"));

// const HelpPage = React.lazy(() => import("./views/Dashboard/HelpPage"));
// const SettingPage = React.lazy(() => import("./views/Dashboard/SettingPage"));
// const DayPlanUpload = React.lazy(() => import("./views/Dashboard/DayPlan/DayPlanUpload"));
// const DayPlanReport = React.lazy(() => import("./views/Dashboard/DayPlanReport/DayPlanReport"));
// const DayPlanSummary = React.lazy(() => import("./views/Dashboard/DayPlanSummary/DayPlanSummary"));

// // Administration pages

const UserManagement = React.lazy(() => import("./views/UserManagement/UserManagement"));

const ParentReport = React.lazy(() => import("../src/views/Reports/ParentReport"));


function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading) {
    return <PageLoader />;
  }


  return isAuthenticated ? (
    <MainLayout>
      {/*  <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense> */}
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />

  );
}

function PublicRoute() {
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading) {
    return <PageLoader />;
  }

  return !isAuthenticated ? (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  ) : (
    <Navigate to="/addmarks" replace />
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/addmarks" element={<AddMarks />} />
        <Route path="/sample" element={<UnderDevelopmentPage />} />
        <Route path="/teacherdashboard" element={<TeacherDashboard />} />
        <Route path="/commondashboard" element={<CommonDashboard />} />
        <Route path="/systemManagement" element={<SystemManagementPage />} />
        {/* <Route path="/dayPlan" element={<DayPlanUpload />} />
        <Route path="/production" element={<ProductionUpdatePage />} />*/}
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/managementStaff" element={<ManagementStaff />} />
        <Route path="/teacherReport" element={<ClassTeacherReport />} />
        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/help" element={<HelpPage />} />
        {/* 
        <Route path="/setting" element={<SettingPage />} />
        <Route path="/dayReport" element={<DayPlanReport />} />
        <Route path="/daySummary" element={<DayPlanSummary />} />*/}
        <Route path="/userAccessManagement" element={<UserAccessManagementSystem/>} /> 


        {/* 
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/production" element={<ProductionUpdatePage />} />
        */}
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/teacherReport" element={<ClassTeacherReport/>} />
        <Route path="/parentReport" element={<ParentReport/>} />
        
        {/* 
        <Route path="/setting" element={<SettingPage />} />
        <Route path="/dayReport" element={<DayPlanReport />} />
        <Route path="/daySummary" element={<DayPlanSummary />} />
         */}
        


      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>



      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default AppRoutes;
