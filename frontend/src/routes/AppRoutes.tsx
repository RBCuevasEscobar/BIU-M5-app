import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TutoringSearchPage } from '../features/tutoring/TutoringSearchPage';
import { MyAppointmentsPage } from '../features/tutoring/MyAppointmentsPage';
import { GroupManagementPage } from '../features/groups/GroupManagementPage';
import { AttendanceRegisterPage } from '../features/attendance/AttendanceRegisterPage';
import { AcademicCatalogPage } from '../features/academic/AcademicCatalogPage';
import { TalkIOPracticePage } from '../features/talkio/TalkIOPracticePage';
import { AuditLogsPage } from '../features/administration/AuditLogsPage';
import { UserManagementPage } from '../features/users/UserManagementPage';

export const AppRoutes: React.FC = () => {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tutoring/search" element={<TutoringSearchPage />} />
        <Route path="tutoring/my-appointments" element={<MyAppointmentsPage />} />
        <Route path="groups" element={<GroupManagementPage />} />
        <Route path="attendance" element={<AttendanceRegisterPage />} />
        <Route path="academic" element={<AcademicCatalogPage />} />
        <Route path="talkio" element={<TalkIOPracticePage />} />
        <Route path="admin/audit" element={<AuditLogsPage />} />
        <Route path="users" element={hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPERVISOR') ? <UserManagementPage /> : <Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
