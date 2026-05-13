import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, Space } from 'antd';
import {
  DesktopOutlined,
  AlertOutlined,
  CalendarOutlined,
  HomeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { dashboardApi, type TeacherStats } from '../../api/dashboard';

const { Title } = Typography;

const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập load dữ liệu (Bạn sẽ thay bằng gọi API thực tế)
    setTimeout(() => {
      setStats({
        totalRooms: 12,
        activeComputers: 450,
        pendingIncidents: 5,
        myClassesToday: 3
      });
      setLoading(false);
    }, 500);
  }, []);

  // Dữ liệu mẫu cho biểu đồ trạng thái máy tính
  const pieData = [
    { type: 'Sẵn sàng', value: 400 },
    { type: 'Đang sử dụng', value: 40 },
    { type: 'Đang bảo trì', value: 10 },
  ];

  const pieConfig = {
    appendPadding: 10,
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: { type: 'outer' },
    interactions: [{ type: 'element-active' }],
  };

  const incidentColumns = [
    { title: 'Phòng', dataIndex: 'room', key: 'room' },
    { title: 'Máy số', dataIndex: 'pc', key: 'pc' },
    { title: 'Nội dung', dataIndex: 'issue', key: 'issue' },
    {
      title: 'Mức độ',
      dataIndex: 'level',
      render: (level: string) => (
        <Tag color={level === 'Cao' ? 'red' : 'orange'}>{level}</Tag>
      )
    },
  ];

  const recentIncidents = [
    { key: '1', room: 'Lab 101', pc: 'PC-05', issue: 'Không lên màn hình', level: 'Cao' },
    { key: '2', room: 'Lab 202', pc: 'PC-12', issue: 'Chuột hỏng', level: 'Thấp' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 24]} justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Bảng điều khiển Giáo viên</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} danger>
            Báo cáo sự cố mới
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title="Phòng máy quản lý" value={stats?.totalRooms} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title="Máy đang hoạt động" value={stats?.activeComputers} prefix={<DesktopOutlined />} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title="Sự cố chưa xử lý" value={stats?.pendingIncidents} prefix={<AlertOutlined />} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title="Ca dạy hôm nay" value={stats?.myClassesToday} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Chart */}
        <Col span={10}>
          <Card title="Tình trạng máy tính hệ thống">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>

        {/* Recent Incidents Table */}
        <Col span={14}>
          <Card title="Sự cố vừa báo cáo" extra={<a href="#">Xem tất cả</a>}>
            <Table
              columns={incidentColumns}
              dataSource={recentIncidents}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherDashboard;