import React, { useEffect, useState } from 'react';
import { AlertOutlined, CheckCircleOutlined, ToolOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Button, Card, message, Select, Space, Table, Tag, Tooltip } from 'antd';
import { incidentApi, type Incident, type IncidentStatus, type Priority } from '../../api/incident';

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

const getComputerCode = (record: Incident) => {
  const computer = record as Incident & { computer?: { computerCode?: string } };
  return computer.computer?.computerCode || record.computerCode || '-';
};

const getRoomName = (record: Incident) => {
  const computer = record as Incident & { computer?: { roomName?: string; room?: { roomName?: string } } };
  return computer.computer?.roomName || computer.computer?.room?.roomName || record.roomName || '-';
};

const AssignedIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchAssignedIncidents = async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await incidentApi.getAssignedToMe(page - 1, pagination.pageSize);
      const content = res.data.content;
      const filteredContent = status ? content.filter(incident => incident.status === status) : content;

      setIncidents(filteredContent);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: status ? filteredContent.length : res.data.totalElements,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách sự cố được gán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIncidents();
  }, []);

  const handleStatusChange = async (id: number, status: IncidentStatus) => {
    try {
      await incidentApi.updateStatus(id, status);
      message.success('Đã cập nhật trạng thái sự cố');
      fetchAssignedIncidents(pagination.current);
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

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
      key: 'room',
      render: (_, record) => getRoomName(record),
    },
    {
      title: 'Mã máy',
      key: 'computerCode',
      render: (_, record) => <strong>{getComputerCode(record)}</strong>,
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
      title: 'Ngày báo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => createdAt ? createdAt.split('T')[0] : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (status: IncidentStatus, record) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={value => handleStatusChange(record.id, value)}
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chuyển sang đang sửa chữa">
            <Button
              type="text"
              icon={<ToolOutlined style={{ color: '#fa8c16' }} />}
              disabled={record.status === 'IN_PROGRESS' || record.status === 'RESOLVED'}
              onClick={() => handleStatusChange(record.id, 'IN_PROGRESS')}
            />
          </Tooltip>
          <Tooltip title="Đánh dấu đã khắc phục">
            <Button
              type="text"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              disabled={record.status === 'RESOLVED'}
              onClick={() => handleStatusChange(record.id, 'RESOLVED')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<span><AlertOutlined /> Danh sách báo cáo sự cố được gán</span>}
      extra={
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 200 }}
          value={statusFilter}
          onChange={value => {
            setStatusFilter(value);
            fetchAssignedIncidents(1, value);
          }}
          options={statusOptions}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={incidents}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: page => fetchAssignedIncidents(page),
        }}
      />
    </Card>
  );
};

export default AssignedIncidents;
