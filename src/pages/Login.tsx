import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Card, Typography, Select, message, Layout, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onFinish = (values: any) => {
    setLoading(true);
    
    // Giả lập độ trễ mạng (API call)
    setTimeout(() => {
      console.log('Received values of form: ', values);
      
      // Thực hiện đăng nhập thông qua Context
      login(values.role);
      
      message.success(`Đăng nhập thành công với vai trò ${values.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}`);
      
      // Điều hướng dựa trên vai trò
      if (values.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/teacher');
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card 
          style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          bordered={false}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 0 }}>VinhUniLab</Title>
            <Text type="secondary">Hệ thống quản lý phòng máy tính</Text>
          </div>

          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true, role: 'teacher' }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Tên đăng nhập" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item name="role" label="Vai trò">
              <Select>
                <Select.Option value="teacher">Giáo viên</Select.Option>
                <Select.Option value="admin">Quản trị viên</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>

              <a className="login-form-forgot" href="" style={{ float: 'right' }}>
                Quên mật khẩu?
              </a>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button" block loading={loading}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
