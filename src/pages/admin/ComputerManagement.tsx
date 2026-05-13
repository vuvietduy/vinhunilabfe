import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DesktopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { computerApi, type Computer, type ComputerStatus } from '../../api/computer';
import { roomApi, type Room } from '../../api/room';

const ComputerManagement: React.FC = () => {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, roomRes] = await Promise.all([
        computerApi.getAll(),
        roomApi.getAll()
      ]);
      setComputers(compRes.data);
      setRooms(roomRes.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingComputer) {
        await computerApi.update(editingComputer.id, values);
        message.success('Cập nhật máy tính thành công');
      } else {
        await computerApi.create(values);
        message.success('Thêm máy tính mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const statusColors = {
    ["AVAILABLE"]: 'green',
    ["IN_USE"]: 'blue',
    ["MAINTENANCE"]: 'orange',
    ["BROKEN"]: 'red',
  };

  const columns: ColumnsType<Computer> = [
    {
      title: 'Mã máy',
      dataIndex: 'computerCode',
      key: 'computerCode',
      render: (text) => <b>{text}</b>
    },
    {
      title: 'Phòng máy',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (_, record) => {
        const room = rooms.find(r => r.id === record.roomId);
        return room ? room.roomName : `ID Phòng: ${record.roomId}`;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ComputerStatus) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} type="text" onClick={() => {
            setEditingComputer(record);
            form.setFieldsValue(record);
            setIsModalOpen(true);
          }} />
          <Popconfirm title="Xóa máy tính này?" onConfirm={() => computerApi.delete(record.id).then(() => fetchData())}>
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ margin: '16px 16px' }}
      title={<span><DesktopOutlined /> Quản lý máy tính</span>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingComputer(null); form.resetFields(); setIsModalOpen(true); }}>Thêm máy</Button>}
    >
      <Table columns={columns} dataSource={computers} rowKey="id" loading={loading} />

      <Modal
        title={editingComputer ? "Sửa máy tính" : "Thêm máy tính mới"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="computerCode" label="Mã máy (Ví dụ: LAB1-PC01)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="roomId" label="Thuộc phòng máy" rules={[{ required: true }]}>
            <Select placeholder="Chọn phòng">
              {rooms.map(room => (
                <Select.Option key={room.id} value={room.id}>{room.roomName}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue="AVAILABLE">
            <Select>
              <Select.Option value="AVAILABLE">Sẵn sàng</Select.Option>
              <Select.Option value="MAINTENANCE">Bảo trì</Select.Option>
              <Select.Option value="BROKEN">Hỏng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="specs" label="Cấu hình phần cứng">
            <Input.TextArea placeholder="RAM, CPU, VGA..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ComputerManagement;