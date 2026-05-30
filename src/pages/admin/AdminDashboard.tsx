import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, message } from 'antd';
import {
  UserOutlined,
  DesktopOutlined,
  AlertOutlined,
  HomeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { adminStatsApi, type AdminStats } from '../../api/dashboard';
import { bookingApi, type Booking, type BookingStatus } from '../../api/booking';
import { statusMap } from './BookingManagement';

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, recentBookings] = await Promise.all([
        adminStatsApi.getOverview(),
        bookingApi.getRecent(),
      ]);
      setStats(statsData.data);
      setRecentBookings(recentBookings.data.content);
    } catch (error) {
      message.error("Không thể tải thống kê quản trị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Giả lập gọi API (Bạn hãy thay bằng adminStatsApi.getOverview())
    fetchData();

    // setTimeout(() => {
    //   setStats({
    //     totalUsers: 45,
    //     totalRooms: 8,
    //     totalComputers: 320,
    //     openIncidents: 12,
    //     usageRatio: 78,
    //     incidentStatusData: [
    //       { type: 'Đã xử lý', value: 25 },
    //       { type: 'Đang sửa', value: 10 },
    //       { type: 'Mới tiếp nhận', value: 5 },
    //     ],
    //     monthlyUsageData: [
    //       { month: 'Tháng 1', hours: 450 },
    //       { month: 'Tháng 2', hours: 520 },
    //       { month: 'Tháng 3', hours: 610 },
    //       { month: 'Tháng 4', hours: 480 },
    //       { month: 'Tháng 5', hours: 700 },
    //     ]
    //   });
    //   setLoading(false);
    // }, 800);

  }, []);

  // Cấu hình biểu đồ cột (Tình hình sử dụng phòng máy)
  const columnConfig = {
    data: stats?.monthlyUsageData || [],
    xField: 'month',
    yField: 'hours',
    label: { position: 'middle', style: { fill: '#FFFFFF', opacity: 0.6 } },
    columnStyle: { radius: [4, 4, 0, 0] },
    color: '#1890ff',
  };

  // Cấu hình biểu đồ tròn (Trạng thái sự cố)
  const pieConfig = {
    appendPadding: 10,
    data: stats?.incidentStatusData || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: { type: 'inner', offset: '-50%', content: '{value}', style: { textAlign: 'center', fontSize: 14 } },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: {
      title: false,
      content: { style: { whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis' }, content: 'Sự cố' },
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Bảng điều khiển quản trị (Admin)</Title>
      <Text type="secondary">Chào mừng bạn trở lại, hệ thống đang hoạt động ổn định.</Text>

      {/* 1. Hàng Thống kê tổng quát */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Tổng người dùng"
              value={stats?.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Số phòng máy hoạt động"
              value={stats?.totalRooms}
              prefix={<HomeOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Tổng số máy tính"
              value={stats?.totalComputers}
              prefix={<DesktopOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Sự cố chưa đóng"
              value={stats?.openIncidents}
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertOutlined />}
              suffix={<small style={{ fontSize: '12px' }}>Yêu cầu</small>}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. Hàng Biểu đồ Phân tích */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Tần suất sử dụng phòng máy (Giờ/Tháng)" bordered={false}>
            <Column {...columnConfig} height={350} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân loại trạng thái sự cố" bordered={false}>
            <Pie {...pieConfig} height={350} />
          </Card>
        </Col>
      </Row>

      {/* 3. Bảng tóm tắt hoạt động gần đây */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Yêu cầu mượn phòng chờ duyệt mới nhất" bordered={false}>
            <Table
              pagination={false}
              dataSource={recentBookings}
              columns={[
                {
                  title: 'Người mượn',
                  dataIndex: 'user',
                  key: 'user',
                  render: (user) => user?.fullName
                },
                {
                  title: 'Phòng',
                  dataIndex: 'room',
                  key: 'room',
                  render: (room) => room?.roomName
                },
                {
                  title: 'Thời gian',
                  key: 'time',
                  render: (_, record) => (
                    <div>
                      <Tag icon={<CalendarOutlined />}>{record.bookingDate}</Tag>
                      <br />
                      <small>{record.startTime} - {record.endTime}</small>
                    </div>
                  )
                },
                { title: 'Mục đích', dataIndex: 'purpose', key: 'purpose', ellipsis: true },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  render: (status: BookingStatus) => (
                    <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
                  )
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;