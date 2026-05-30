import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Button, Space, Card, message, Popconfirm, Tooltip } from 'antd';
import { AlertOutlined, CheckCircleOutlined, DeleteOutlined, UserSwitchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { incidentApi, type Incident, type IncidentStatus, type Priority } from '../../api/incident';
import { roomApi, type Room } from '../../api/room';
import { userApi, type User } from '../../api/user';

const IncidentManagement: React.FC = () => {
  const [data, setData] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getAll();
      setRooms(res.data);
    } catch (error) {
      message.error('Không thể tải danh sách phòng');
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await userApi.getAll();
      setTechnicians(res.data.filter(user => user.role === 'TECHNICIAN'));
    } catch (error) {
      message.error('Không thể tải danh sách kỹ thuật viên');
    }
  };

  const fetchIncidents = async (page = 1, status = filterStatus) => {
    setLoading(true);
    try {
      const res = await incidentApi.search({
        filter: status ? `status=='${status}'` : 'id!=0',
        page: page - 1,
        size: pagination.pageSize,
        sort: ['id,desc'],
      });
      setData(res.data.content);
      setPagination(prev => ({ ...prev, current: page, total: res.data.totalElements }));
    } catch (error) {
      message.error('Lỗi tải danh sách sự cố');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchRooms();
    fetchTechnicians();
  }, []);

  const handleStatusChange = async (id: number, newStatus: IncidentStatus) => {
    try {
      await incidentApi.updateStatus(id, newStatus);
      message.success('Đã cập nhật trạng thái sự cố');
      fetchIncidents(pagination.current);
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleAssignTechnician = async (id: number, technicianId: number) => {
    try {
      await incidentApi.assignTechnician(id, technicianId);
      message.success('Đã gán kỹ thuật viên xử lý sự cố');
      fetchIncidents(pagination.current);
    } catch (error) {
      message.error('Gán kỹ thuật viên thất bại');
    }
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

  const columns: ColumnsType<Incident> = [
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
      title: 'Nội dung sự cố',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
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
      extra={
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 200 }}
          onChange={value => {
            setFilterStatus(value);
            fetchIncidents(1, value);
          }}
          options={statusOptions}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: page => fetchIncidents(page),
        }}
      />
    </Card>
  );
};

export default IncidentManagement;
