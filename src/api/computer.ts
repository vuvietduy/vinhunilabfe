import axiosClient from './axiosClient';

export type ComputerStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'BROKEN';

export interface Computer {
  id: number;
  computerCode: string;
  status: ComputerStatus;
  roomId: number;
  roomName?: string; // Dùng để hiển thị tên phòng trên bảng
  specs?: string;
}

export const computerApi = {
  getAll: () => axiosClient.get<Computer[]>('/admin/computers/findAll'),
  create: (data: Partial<Computer>) => axiosClient.post<Computer>('/admin/computers/create', data),
  update: (id: number, data: Partial<Computer>) => axiosClient.put<Computer>(`/admin/computers/update?id=${id}`, data),
  delete: (id: number) => axiosClient.delete(`/admin/computers/delete?id=${id}`),
};