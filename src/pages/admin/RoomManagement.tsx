import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { roomApi, type Room } from '../../api/room';

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  // Hàm tải dữ liệu từ API
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomApi.getAll();
      setRooms(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách phòng máy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const keys = Object.keys(filter) as Array<keyof Room | 'isActive'>;
    return rooms.filter(room => {
      return keys.every(key => {
        const value = filter[key];
        if (!value) return true;
        const terms = value.split(';').map(term => term.trim()).filter(Boolean);
        if (!terms.length) return true;

        let fieldValue = '';
        if (key === 'isActive') {
          fieldValue = room.isActive ? 'Hoạt động' : 'Bảo trì';
        } else {
          fieldValue = String((room as any)[key] ?? '');
        }
        return terms.some(term => fieldValue.toLowerCase().includes(term.toLowerCase()));
      });
    });
  }, [rooms, filter]);

  const showAddModal = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (record: Room) => {
    setEditingRoom(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRoom) {
        // Gọi API Update
        await roomApi.update(editingRoom.id, values);
        message.success('Cập nhật phòng thành công');
      } else {
        // Gọi API Create
        await roomApi.create(values);
        message.success('Thêm phòng mới thành công');
      }
      setIsModalOpen(false);
      fetchRooms(); // Load lại bảng
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await roomApi.delete(id);
      message.success('Đã xóa phòng');
      fetchRooms();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const columns: ColumnsType<Room> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_value, _record, index) => index + 1,
    },
    { title: 'Mã phòng', dataIndex: 'roomCode', key: 'roomCode', width: 100 },
    { title: 'Tên phòng', dataIndex: 'roomName', key: 'roomName', sorter: (a, b) => a.roomName.localeCompare(b.roomName) },
    { title: 'Vị trí', dataIndex: 'location', key: 'location' },
    { title: 'Số máy', dataIndex: 'totalSeats', key: 'totalSeats', sorter: (a, b) => a.totalSeats - b.totalSeats },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Hoạt động' : 'Bảo trì'}</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)} type="text" style={{ color: '#1890ff' }} />
          <Popconfirm title="Xóa phòng này?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ margin: '16px 16px' }}
      title="Quản lý phòng máy VinhUniLab"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchRooms} />
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>Thêm phòng</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true, totalSeats: 20 }}>
          <Form.Item name="roomCode" label="Mã phòng" rules={[{ required: true, message: 'Nhập mã phòng!' }]}>
            <Input placeholder="Ví dụ: Lab 101" />
          </Form.Item>
          <Form.Item name="roomName" label="Tên phòng" rules={[{ required: true, message: 'Nhập tên phòng!' }]}>
            <Input placeholder="Ví dụ: Lab 101" />
          </Form.Item>
          <Form.Item name="location" label="Vị trí (Tòa/Tầng)" rules={[{ required: true, message: 'Nhập vị trí!' }]}>
            <Input placeholder="Ví dụ: Tầng 2 - Nhà A" />
          </Form.Item>
          <Form.Item name="totalSeats" label="Số lượng máy">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoomManagement;