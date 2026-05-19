import axiosClient from "./axiosClient";

export interface Room {
  id: number;
  roomCode: string;
  roomName: string;
  location: string; // Khớp với DB: location thay vì building/floor
  totalSeats: number;
  isActive: boolean;
}

export const roomApi = {
  getAll: () => axiosClient.get<Room[]>('/admin/rooms/findAll'),
  getById: (id: number) => axiosClient.get<Room>(`/admin/rooms/update/${id}`),
  create: (data: Partial<Room>) => axiosClient.post<Room>('/admin/rooms/create', data),
  update: (id: number, data: Partial<Room>) => axiosClient.put<Room>(`/admin/rooms/update?id=${id}`, data),
  delete: (id: number) => axiosClient.delete(`/admin/rooms/delete?id=${id}`),
};