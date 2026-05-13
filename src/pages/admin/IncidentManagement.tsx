import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Button, Space, Card, Typography, message, Popconfirm, Tooltip } from 'antd';
import { CheckCircleOutlined, SyncOutlined, DeleteOutlined, AlertOutlined } from '@ant-design/icons';
import { incidentApi } from '../../api/incident';
import { type Incident, type IncidentStatus, type Priority } from '../../api/incident';
import { roomApi, type Room } from '../../api/room';

const { Title } = Typography;

const IncidentManagement: React.FC = () => {
  const [data, setData] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getAll(); // Giả sử có API này để lấy danh sách phòng
      setRooms(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách phòng");
    }
  };

  const fetchIncidents = async (page = 1, status = filterStatus) => {
    setLoading(true);
    try {
      const res = await incidentApi.search({
        page: page - 1,
        size: pagination.pageSize,
        status
      });
      setData(res.data.content);
      setPagination(prev => ({ ...prev, current: page, total: res.data.totalElements }));
    } catch (error) {
      message.error("Lỗi tải danh sách sự cố");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchRooms();
  }, []);

  const handleStatusChange = async (id: number, newStatus: IncidentStatus) => {
    try {
      await incidentApi.updateStatus(id, newStatus);
      message.success("Đã cập nhật trạng thái sự cố");
      fetchIncidents(pagination.current);
    } catch (error) {
      message.error("Cập nhật thất bại");
    }
  };

  const priorityMap: Record<Priority, { color: string, label: string }> = {
    LOW: { color: 'blue', label: 'Thấp' },
    NORMAL: { color: 'orange', label: 'Trung bình' },
    HIGH: { color: 'red', label: 'Khẩn cấp' },
  };

  const statusOptions = [
    { value: 'OPEN', label: 'Mới tiếp nhận', color: 'magenta' },
    { value: 'IN_PROGRESS', label: 'Đang sửa chữa', color: 'processing' },
    { value: 'RESOLVED', label: 'Đã khắc phục', color: 'success' },
    { value: 'CLOSED', label: 'Đã đóng', color: 'default' },
  ];

  const columns = [
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (s: Priority) => (
        <Tag color={priorityMap[s].color} style={{ fontWeight: 'bold' }}>
          {priorityMap[s].label}
        </Tag>
      ),
    },
    {
      title: 'Phòng',
      dataIndex: 'computer',
      key: 'computer',
      render: (c: any) => {
        const room = rooms.find(r => r.id === c?.roomId);
        return room ? room.roomName : '-';
      }
    },
    {
      title: 'Mã máy',
      dataIndex: 'computer',
      key: 'computer',
      render: (c: any) => c ? <b>{c.computerCode}</b> : '-'
    },
    { title: 'Nội dung sự cố', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Người báo',
      dataIndex: 'reportedBy',
      key: 'reportedBy',
      render: (reportedBy: any) => reportedBy?.fullName || '-'
    },
    {
      title: 'Trạng thái xử lý',
      dataIndex: 'status',
      key: 'status',
      render: (status: IncidentStatus, record: Incident) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={(val) => handleStatusChange(record.id, val)}
          options={statusOptions.map(opt => ({
            value: opt.value,
            label: <Tag color={opt.color}>{opt.label}</Tag>
          }))}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Incident) => (
        <Space>
          <Tooltip title="Đánh dấu đã xong nhanh">
            <Button
              type="text"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleStatusChange(record.id, 'RESOLVED')}
            />
          </Tooltip>
          <Popconfirm title="Xóa báo cáo này?" onConfirm={() => incidentApi.delete(record.id).then(() => fetchIncidents())}>
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
          onChange={(val) => { setFilterStatus(val); fetchIncidents(1, val); }}
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
          onChange: (page) => fetchIncidents(page)
        }}
      />
    </Card>
  );
};

export default IncidentManagement;