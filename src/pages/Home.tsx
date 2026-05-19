import { Button, Card, Col, Row, Space, Typography } from 'antd';
import {
  DesktopOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  AlertOutlined,
  CalendarOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DesktopOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Quản lý máy tính',
      description: 'Theo dõi trạng thái, phân loại và bảo trì thiết bị trong tất cả phòng máy.',
    },
    {
      icon: <FolderOpenOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: 'Quản lý phòng',
      description: 'Tạo, cập nhật và xem chi tiết các phòng máy, quy mô và tiện nghi.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'Quản lý người dùng',
      description: 'Phân quyền admin/teacher, quản lý tài khoản và thông tin giáo viên.',
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      title: 'Đặt phòng và lịch sử',
      description: 'Xem và duyệt yêu cầu đặt phòng, đồng bộ lịch trình sử dụng phòng máy.',
    },
    {
      icon: <AlertOutlined style={{ fontSize: 24, color: '#cf1322' }} />,
      title: 'Báo cáo sự cố',
      description: 'Theo dõi các báo cáo lỗi, phân loại và đóng yêu cầu trong hệ thống.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px', background: '#f0f2f5' }}>
      <Row justify="center" style={{ marginBottom: 32 }}>
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          <div style={{ padding: 32, borderRadius: 20, background: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} md={14}>
                <Typography>
                  <Title level={1} style={{ marginBottom: 16 }}>
                    VinhUniLab
                  </Title>
                  <Paragraph style={{ fontSize: 18, lineHeight: 1.8 }}>
                    Trang quản lý phòng máy tính dành cho Admin và Giáo viên. Quản lý phòng máy, máy tính,
                    đặt phòng và báo cáo sự cố trong một nền tảng trực quan, nhanh gọn và an toàn.
                  </Paragraph>
                  <Paragraph style={{ fontSize: 16, color: 'rgba(0,0,0,0.65)' }}>
                    Giúp bộ phận CNTT và đội ngũ giảng dạy nắm bắt tình trạng phòng máy nhanh chóng, tối ưu
                    lịch sử dụng và xử lý sự cố kịp thời.
                  </Paragraph>

                  <Space wrap direction="horizontal" style={{ marginTop: 16 }}>
                    <Button type="primary" size="large" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                      Đăng nhập ngay
                    </Button>
                    <Button size="large" onClick={() => navigate('/login')}>
                      Xem demo
                    </Button>
                  </Space>
                </Typography>
              </Col>
              <Col xs={24} md={10}>
                <Card
                  bordered={false}
                  style={{ borderRadius: 16, background: '#fafafa' }}
                >
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Tính năng nổi bật
                  </Title>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <DesktopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                      <span>Giám sát và bảo trì máy tính</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FolderOpenOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                      <span>Quản lý phòng máy theo nhu cầu</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CalendarOutlined style={{ fontSize: 24, color: '#faad14' }} />
                      <span>Đặt phòng và lịch sử sử dụng</span>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]} justify="center">
        {features.map((feature) => (
          <Col key={feature.title} xs={24} sm={12} lg={8} xxl={6}>
            <Card hoverable style={{ borderRadius: 16, minHeight: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                {feature.icon}
                <Title level={4} style={{ margin: 0 }}>
                  {feature.title}
                </Title>
              </div>
              <Paragraph style={{ color: 'rgba(0,0,0,0.65)' }}>{feature.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Title level={3}>Bắt đầu quản lý phòng máy của bạn ngay hôm nay</Title>
        <Paragraph style={{ maxWidth: 680, margin: '0 auto', color: 'rgba(0,0,0,0.65)' }}>
          Đăng nhập để truy cập giao diện Admin hoặc Giáo viên, duyệt đăng ký, cập nhật trạng thái máy và xử lý sự cố nhanh chóng.
        </Paragraph>
      </div>
    </div>
  );
}
