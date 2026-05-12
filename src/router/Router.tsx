import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Login';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Admin pages
import AdminStatistics from '../pages/admin/AdminStatistics';
import RoomManagement from '../pages/admin/RoomManagement';
import DeviceManagement from '../pages/admin/DeviceManagement';
import ReportManagementAdmin from '../pages/admin/ReportManagement';

// Teacher pages
import TeacherStatistics from '../pages/teacher/TeacherStatistics';
import BookingManagement from '../pages/teacher/BookingManagement';
import ReportManagementTeacher from '../pages/teacher/ReportManagement';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminStatistics /> },
      { path: 'room-management', element: <RoomManagement /> },
      { path: 'device-management', element: <DeviceManagement /> },
      { path: 'report-management', element: <ReportManagementAdmin /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['TEACHER']}>
        <TeacherLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TeacherStatistics /> },
      { path: 'booking-management', element: <BookingManagement /> },
      { path: 'report-management', element: <ReportManagementTeacher /> },
    ],
  },
]);
