import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, message, Space, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AlertOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FormOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { dashboardApi, type TeacherStats } from '../../api/dashboard';

const { Title, Text } = Typography;

type RecentIncident = NonNullable<TeacherStats['recentIncidentData']>[number] & {
  key: React.Key;
};

const priorityMap: Record<string, { color: string; label: string }> = {
  LOW: { color: 'blue', label: 'Thấp' },
  NORMAL: { color: 'orange', label: 'Trung bình' },
  HIGH: { color: 'red', label: 'Cao' },
  Cao: { color: 'red', label: 'Cao' },
  Thấp: { color: 'blue', label: 'Thấp' },
};

const incidentStatusMap: Record<string, { color: string; label: string }> = {
  OPEN: { color: 'magenta', label: 'Chưa xử lý' },
  IN_PROGRESS: { color: 'processing', label: 'Đang xử lý' },
  RESOLVED: { color: 'success', label: 'Đã xử lý' },
  CLOSED: { color: 'default', label: 'Đã đóng' },
};

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getTeacherStats();
      setStats(response.data);
    } catch {
      message.error('Không thể tải thống kê giáo viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const incidentStatusData = useMemo(() => {
    if (stats?.incidentStatusData?.length) {
      return stats.incidentStatusData;
    }

    return [
      { type: 'Chưa xử lý', value: stats?.openIncidents ?? 0 },
      { type: 'Đang xử lý', value: stats?.inProgressIncidents ?? 0 },
      { type: 'Đã xử lý', value: stats?.resolvedIncidents ?? 0 },
    ].filter(item => item.value > 0);
  }, [stats]);

  const recentIncidents = useMemo<RecentIncident[]>(
    () =>
      (stats?.recentIncidentData ?? []).map((incident, index) => ({
        ...incident,
        key: incident.id ?? index,
      })),
    [stats]
  );

  const incidentPieConfig = {
    data: incidentStatusData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.55,
    label: {
      text: 'value',
      style: { fontWeight: 600 },
    },
    legend: {
      color: {
        title: false,
        position: 'bottom',
      },
    },
  };

  const incidentColumns: ColumnsType<RecentIncident> = [
    {
      title: 'Phòng',
      key: 'room',
      render: (_, record) => record.roomname ?? '-',
    },
    {
      title: 'Máy',
      key: 'pc',
      render: (_, record) => <strong>{record.pc ?? record.computercode ?? '-'}</strong>,
    },
    {
      title: 'Nội dung',
      key: 'issue',
      render: (_, record) => record.description ?? '-',
      ellipsis: true,
    },
    {
      title: 'Mức độ',
      key: 'level',
      width: 120,
      render: (_, record) => {
        const level = record.priority ?? '-';
        const meta = priorityMap[level] ?? { color: 'default', label: level };

        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const status = record.status ?? '-';
        const meta = incidentStatusMap[status] ?? { color: 'default', label: status };

        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%', padding: 24 }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col>
          <Title level={2} style={{ margin: 0 }}>Thống kê giáo viên</Title>
          <Text type="secondary">Theo dõi nhanh lịch đặt phòng và tình trạng các sự cố đã báo cáo.</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<FormOutlined />}
            danger
            onClick={() => navigate('/teacher/report-management')}
          >
            Báo cáo sự cố mới
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Tổng lượt đặt phòng"
              value={stats?.totalBookings ?? 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Đặt phòng chờ duyệt"
              value={stats?.pendingBookings ?? 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Sự cố chưa xử lý"
              value={stats?.openIncidents ?? 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Sự cố đang xử lý"
              value={stats?.inProgressIncidents ?? 0}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="Trạng thái sự cố" bordered={false} loading={loading}>
            {incidentStatusData.length ? (
              <Pie {...incidentPieConfig} height={320} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu trạng thái sự cố" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Sự cố vừa báo cáo" bordered={false}>
            <Table
              columns={incidentColumns}
              dataSource={recentIncidents}
              loading={loading}
              pagination={false}
              size="middle"
              locale={{ emptyText: 'Chưa có sự cố nào' }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default TeacherDashboard;
