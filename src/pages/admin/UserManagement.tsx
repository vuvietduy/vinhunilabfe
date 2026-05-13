import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card, Tag } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userApi, type User, type UserRole } from '../../api/user';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll();
      setUsers(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userApi.update(editingUser.id, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await userApi.create(values);
        message.success('Tạo tài khoản thành công');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'magenta',
    TEACHER: 'blue',
    TECHNICIAN: 'orange',
  };

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
    },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Quyền hạn',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={roleColors[role]}>{role}</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue({ ...record, password: '' }); // Không hiện mật khẩu cũ
              setIsModalOpen(true);
            }}
          />
          {record.role !== 'ADMIN' && ( // Không cho phép xóa Admin chính qua UI này
            <Popconfirm title="Xóa người dùng này?" onConfirm={() => userApi.delete(record.id).then(() => fetchUsers())}>
              <Button icon={<DeleteOutlined />} type="text" danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ margin: '16px 16px' }}
      title={<span><UserOutlined /> Quản lý tài khoản hệ thống</span>}
      extra={
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => {
          setEditingUser(null);
          form.resetFields();
          setIsModalOpen(true);
        }}>
          Thêm người dùng
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Tạo tài khoản mới"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập username' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
            rules={[{ required: !editingUser, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ type: 'email' }, { required: true }]}>
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item name="role" label="Quyền hạn" initialValue="TEACHER">
            <Select>
              <Select.Option value="TEACHER">Giáo viên</Select.Option>
              <Select.Option value="TECHNICIAN">Kỹ thuật viên</Select.Option>
              <Select.Option value="ADMIN">Quản trị viên</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;