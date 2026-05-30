import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Login';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import TechnicianLayout from '../layouts/TechnicianLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import RoomManagement from '../pages/admin/RoomManagement';
import BookingManagement from '../pages/admin/BookingManagement';
import ComputerManagement from '../pages/admin/ComputerManagement';
import UserManagement from '../pages/admin/UserManagement';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherBooking from '../pages/teacher/TeacherBooking';
import IncidentReport from '../pages/teacher/IncidentReport.tsx';
import IncidentManagement from '../pages/admin/IncidentManagement.tsx';
import AdminDashboard from '../pages/admin/AdminDashboard.tsx';
import AssignedIncidents from '../pages/technician/AssignedIncidents.tsx';
import TechnicianDashboard from '../pages/technician/TechnicianDashboard.tsx';

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
      { index: true, element: <AdminDashboard /> },
      { path: 'room-management', element: <RoomManagement /> },
      { path: 'computer-management', element: <ComputerManagement /> },
      { path: 'incident-management', element: <IncidentManagement /> },
      { path: 'booking-management', element: <BookingManagement /> },
      { path: 'user-management', element: <UserManagement /> }
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
      { index: true, element: <TeacherDashboard /> },
      { path: 'booking-management', element: <TeacherBooking /> },
      { path: 'report-management', element: <IncidentReport /> },
    ],
  },
  {
    path: '/technician',
    element: (
      <ProtectedRoute allowedRoles={['TECHNICIAN']}>
        <TechnicianLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TechnicianDashboard /> },
      { path: 'assigned-incidents', element: <AssignedIncidents /> },
    ],
  },
]);
