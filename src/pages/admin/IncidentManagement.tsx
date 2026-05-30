import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Button, Space, Card, message, Popconfirm, Tooltip, Modal, Descriptions } from 'antd';
import { AlertOutlined, CheckCircleOutlined, DeleteOutlined, EyeOutlined, UserSwitchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { incidentApi, type Incident, type IncidentStatus, type Priority } from '../../api/incident';
import { roomApi, type Room } from '../../api/room';
import { userApi, type User } from '../../api/user';

const IncidentManagement: React.FC = () => {
  const [data, setData] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [filter] = useState("id!=0");
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getAll();
      setRooms(res.data);
    } catch {
      message.error('Không thể tải danh sách phòng');
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await userApi.getAll();
      setTechnicians(res.data.filter(user => user.role === 'TECHNICIAN'));
    } catch {
      message.error('Không thể tải danh sách kỹ thuật viên');
    }
  };

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentApi.search({
        filter: filter,
        page: page,
        size: size,
        sort: ['id,desc'],
      });
      setData(res.data.content);
      setTotal(res.data.totalElements);
    } catch {
      message.error('Lỗi tải danh sách sự cố');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, size, filter]);

  useEffect(() => {
    fetchRooms();
    fetchTechnicians();
  }, []);

  const handleStatusChange = async (id: number, newStatus: IncidentStatus) => {
    try {
      await incidentApi.updateStatus(id, newStatus);
      message.success('Đã cập nhật trạng thái sự cố');
    } catch {
      message.error('Cập nhật thất bại');
    }
  };

  const handleAssignTechnician = async (id: number, technicianId: number) => {
    try {
      await incidentApi.assignTechnician(id, technicianId);
      message.success('Đã gán kỹ thuật viên xử lý sự cố');
    } catch {
      message.error('Gán kỹ thuật viên thất bại');
    }
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailModalOpen(true);
  };

  const priorityMap: Record<Priority, { color: string; label: string }> = {
    LOW: { color: 'blue', label: 'Thấp' },
    NORMAL: { color: 'orange', label: 'Trung bình' },
    HIGH: { color: 'red', label: 'Khẩn cấp' },
  };

  const statusOptions: { value: IncidentStatus; label: string; color: string }[] = [
    { value: 'OPEN', label: 'Mới tiếp nhận', color: 'magenta' },
    { value: 'IN_PROGRESS', label: 'Đang sửa chữa', color: 'processing' },
    { value: 'RESOLVED', label: 'Đã khắc phục', color: 'success' },
  ];

  const getRoomName = (incident: Incident) => {
    const room = rooms.find(item => item.id === incident.computer?.roomId);
    return room?.roomName || incident.roomName || '-';
  };

  const getReporterName = (reportedBy: Incident['reportedBy'] | string | undefined) => {
    if (!reportedBy) return '-';
    return typeof reportedBy === 'string' ? reportedBy : reportedBy.fullName || reportedBy.username || '-';
  };

  const getTechnicianName = (incident: Incident) => {
    const technician = (incident as Incident & { technician?: User | null }).technician || incident.assignedTo;
    return technician?.fullName || technician?.username || '-';
  };

  const getStatusOption = (status: IncidentStatus) => (
    statusOptions.find(option => option.value === status)
  );

  const columns: ColumnsType<Incident> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_value, _record, index) => (page * size) + index + 1,
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority: Priority) => (
        <Tag color={priorityMap[priority].color} style={{ fontWeight: 'bold' }}>
          {priorityMap[priority].label}
        </Tag>
      ),
    },
    {
      title: 'Phòng',
      dataIndex: 'computer',
      key: 'room',
      render: (computer: { roomId?: number }) => {
        const room = rooms.find(item => item.id === computer?.roomId);
        return room ? room.roomName : '-';
      },
      filters: rooms.map(room => ({ text: room.roomName, value: room.roomName })),
      filterSearch: true,
      onFilter: (value, record) => {
        const room = rooms.find(item => item.id === record.computer?.roomId);
        return room ? room.roomName.includes(value as string) : false;
      }
    },
    {
      title: 'Mã máy',
      dataIndex: 'computer',
      key: 'computer',
      render: (computer: { computerCode?: string }) => (
        computer?.computerCode ? <b>{computer.computerCode}</b> : '-'
      ),
    },
    {
      title: 'Người báo',
      dataIndex: 'reportedBy',
      key: 'reportedBy',
      render: (reportedBy: { fullName?: string } | string) => (
        typeof reportedBy === 'string' ? reportedBy : reportedBy?.fullName || '-'
      ),
    },
    {
      title: 'Ngày báo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'technician',
      key: 'technician',
      width: 220,
      render: (technician: User | null | undefined, record) => (
        <Select
          placeholder="Chọn kỹ thuật viên"
          value={technician?.id}
          style={{ width: 200 }}
          showSearch
          optionFilterProp="label"
          suffixIcon={<UserSwitchOutlined />}
          onChange={technicianId => handleAssignTechnician(record.id, technicianId)}
          options={technicians.map(technician => ({
            value: technician.id,
            label: technician.fullName || technician.username,
          }))}
        />
      ),
    },
    {
      title: 'Trạng thái xử lý',
      dataIndex: 'status',
      key: 'status',
      render: (status: IncidentStatus, record) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={newStatus => handleStatusChange(record.id, newStatus)}
          options={statusOptions.map(option => ({
            value: option.value,
            label: <Tag color={option.color}>{option.label}</Tag>,
          }))}
        />
      ),
    },
    {
      title: 'Thời gian khắc phục',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      render: (resolvedAt: string | null) => {
        if (!resolvedAt) return '-';
        return new Date(resolvedAt).toLocaleString();
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewIncident(record)}
            />
          </Tooltip>
          <Tooltip title="Đánh dấu đã xong nhanh">
            <Button
              type="text"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleStatusChange(record.id, 'RESOLVED')}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa báo cáo này?"
            onConfirm={() => incidentApi.delete(record.id).then(() => fetchIncidents())}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ margin: '16px 16px' }}
      title={<span><AlertOutlined /> Quản lý danh sách sự cố hệ thống</span>}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page + 1,
          pageSize: size,
          total,
          onChange: (page, pageSize) => {
            setPage(page - 1);
            setSize(pageSize);
          },
        }}
      />

      <Modal
        title="Chi tiết sự cố"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={720}
      >
        {selectedIncident && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mức độ">
              <Tag color={priorityMap[selectedIncident.priority].color}>
                {priorityMap[selectedIncident.priority].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {(() => {
                const statusOption = getStatusOption(selectedIncident.status);
                return statusOption ? (
                  <Tag color={statusOption.color}>{statusOption.label}</Tag>
                ) : selectedIncident.status;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng">
              {getRoomName(selectedIncident)}
            </Descriptions.Item>
            <Descriptions.Item label="Mã máy">
              {selectedIncident.computer?.computerCode || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Người báo">
              {getReporterName(selectedIncident.reportedBy)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày báo">
              {selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Kỹ thuật viên">
              {getTechnicianName(selectedIncident)}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung sự cố">
              {selectedIncident.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian khắc phục">
              {selectedIncident.resolvedAt ? new Date(selectedIncident.resolvedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default IncidentManagement;

