import type { PageResponse } from '../type/PageResponse';
import type { User } from './user';
import axiosClient from './axiosClient';

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH';

export interface Incident {
  id: number;
  computerId: number;
  computerCode: string;
  roomName: string;
  description: string;
  priority: Priority;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo?: User | null;
  createdAt: string;
}

export const incidentApi = {
  // Giáo viên gửi báo cáo
  create: (data: any) => axiosClient.post('/incident-reports/create', data),

  // Giáo viên xem lại các báo cáo mình đã gửi (có phân trang)
  getMyIncidents: (page: number, size: number) =>
    axiosClient.get<PageResponse<Incident>>(`/incident-reports/my`, { params: { page, size } }),

  getAssignedToMe: (page: number, size: number) =>
    axiosClient.get<PageResponse<Incident>>(`/incident-reports/assigned-to-me`, { params: { page, size } }),

  search: (params: {  filter: string, page: number, size: number, sort?: string[] }) =>
    axiosClient.get<PageResponse<Incident>>('/incident-reports/search', { params }),

  // Cập nhật trạng thái sự cố (Ví dụ: Chuyển từ OPEN -> IN_PROGRESS)
  updateStatus: (id: number, status: IncidentStatus) =>
    axiosClient.patch(`/incident-reports/status`, { id, status }),

  assignTechnician: (id: number, technicianId: number) =>
    axiosClient.patch(`/incident-reports/assign`, { id, technicianId }),

  // Xóa báo cáo sai hoặc báo cáo rác
  delete: (id: number) => axiosClient.delete(`/incident-reports/delete?id=${id}`),
};
