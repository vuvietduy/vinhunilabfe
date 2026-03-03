import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 1. Định nghĩa Interface dựa trên Java Class
interface Room {
  id: number;
  roomName: string;
  building: string;
  floor: number;
  description: string;
}

// Dữ liệu mẫu ban đầu
const initialData: Room[] = [
  { id: 1, roomName: 'Lab 101', building: 'Nhà A', floor: 1, description: 'Phòng thực hành lập trình cơ bản' },
  { id: 2, roomName: 'Lab 202', building: 'Nhà B', floor: 2, description: 'Phòng thực hành mạng máy tính' },
];

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  // Mở modal để thêm mới
  const showAddModal = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Mở modal để sửa
  const showEditModal = (record: Room) => {
    setEditingRoom(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // Xử lý khi submit form (Thêm hoặc Sửa)
  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingRoom) {
        // Logic sửa
        const updatedRooms = rooms.map((room) =>
          room.id === editingRoom.id ? { ...room, ...values } : room
        );
        setRooms(updatedRooms);
        message.success('Cập nhật phòng thành công');
      } else {
        // Logic thêm mới (Giả lập ID tăng tự động)
        const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
        const newRoom = { id: newId, ...values };
        setRooms([...rooms, newRoom]);
        message.success('Thêm phòng mới thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  // Xử lý xóa
  const handleDelete = (id: number) => {
    const filteredRooms = rooms.filter((room) => room.id !== id);
    setRooms(filteredRooms);
    message.success('Đã xóa phòng');
  };

  // Cấu hình cột cho bảng
  const columns: ColumnsType<Room> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên phòng',
      dataIndex: 'roomName',
      key: 'roomName',
      sorter: (a, b) => a.roomName.localeCompare(b.roomName),
    },
    {
      title: 'Tòa nhà',
      dataIndex: 'building',
      key: 'building',
      filters: [
        { text: 'Nhà A', value: 'Nhà A' },
        { text: 'Nhà B', value: 'Nhà B' },
      ],
      onFilter: (value, record) => record.building.indexOf(value as string) === 0,
    },
    {
      title: 'Tầng',
      dataIndex: 'floor',
      key: 'floor',
      sorter: (a, b) => a.floor - b.floor,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)} 
            type="text" 
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title="Xóa phòng này?"
            description="Bạn có chắc chắn muốn xóa phòng này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý phòng máy tính" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
        Thêm phòng mới
      </Button>
    }>
      <Table 
        columns={columns} 
        dataSource={rooms} 
        rowKey="id" 
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingRoom ? "Chỉnh sửa thông tin phòng" : "Thêm phòng mới"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingRoom ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          name="roomForm"
          initialValues={{ floor: 1 }}
        >
          <Form.Item
            name="roomName"
            label="Tên phòng"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
          >
            <Input placeholder="Ví dụ: Lab 101" />
          </Form.Item>

          <Form.Item
            name="building"
            label="Tòa nhà"
            rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà!' }]}
          >
            <Input placeholder="Ví dụ: Nhà A" />
          </Form.Item>

          <Form.Item
            name="floor"
            label="Tầng"
            rules={[{ required: true, message: 'Vui lòng nhập số tầng!' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Mô tả chức năng hoặc trang thiết bị của phòng..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoomManagement;
