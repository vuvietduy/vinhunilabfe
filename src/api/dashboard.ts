import axiosClient from './axiosClient';

export interface TeacherStats {
  totalRooms: number;
  openIncidents: number;
  totalIncidents?: number;
  resolvedIncidents?: number;
  inProgressIncidents?: number;
  myClassesToday: number;
  totalBookings?: number;
  approvedBookings?: number;
  pendingBookings?: number;
  incidentStatusData?: { type: string; value: number }[];
  recentIncidentData?: {
    id?: number | string;
    roomname?: string;
    pc?: string;
    computercode?: string;
    status?: string;
    description?: string;
    priority?: string;
  }[];
}

export interface AdminStats {
  totalUsers: number;
  totalRooms: number;
  totalComputers: number;
  openIncidents: number;
  usageRatio: number; // Tỷ lệ sử dụng phòng máy (%)
  incidentStatusData: { type: string, value: number }[]; // Dữ liệu cho biểu đồ tròn
  monthlyUsageData: { month: string, hours: number }[]; // Dữ liệu cho biểu đồ cột
}

export const adminStatsApi = {
  getOverview: () => axiosClient.get<AdminStats>('/stats/admin'),
};

export const dashboardApi = {
  getTeacherStats: () => axiosClient.get<TeacherStats>('/stats/teacher'),
  getRecentIncidents: () => axiosClient.get('/incidents/recent'),
};
