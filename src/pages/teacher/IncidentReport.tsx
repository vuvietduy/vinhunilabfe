import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Card, Tag, message,
  Row,
  Col
} from 'antd';
import {
  AlertOutlined,
  PlusOutlined,
  HistoryOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { incidentApi, type Incident, type Priority } from '../../api/incident';
import { roomApi, type Room } from '../../api/room';
import { computerApi, type Computer } from '../../api/computer';
import { getApiErrorMessage, isFormValidationError } from '../../utils/apiError';

const IncidentReport: React.FC = () => {
  const [form] = Form.useForm();

  // States
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchHistory();
    roomApi.getAll().then(res => setRooms(res.data));
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Giả sử lấy trang đầu tiên, 10 bản ghi
      const res = await incidentApi.getMyIncidents(0, 10);
      setIncidents(res.data.content);
    } catch (error) {
      message.error("Không thể tải lịch sử báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Logic xử lý khi chọn phòng máy
  const handleRoomChange = async (roomId: number) => {
    form.setFieldsValue({ computerId: undefined });
    setLoading(true);
    try {
      const res = await computerApi.getAll(); // Tối ưu: Nên có API filter theo RoomId ở Backend
      setComputers(res.data.filter(c => c.roomId === roomId));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    form.resetFields();
    setComputers([]);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        ...values,
        computer: { id: values.computerId },

      }
      await incidentApi.create(payload);
      message.success("Báo cáo sự cố đã được gửi!");
      setIsModalOpen(false);
      fetchHistory();
    } catch (error) {
      if (isFormValidationError(error)) {
        return;
      }

      message.error(getApiErrorMessage(error, 'Gửi báo cáo sự cố thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Thấp (Chuột, phím...)', color: 'blue' },
    { value: 'NORMAL', label: 'Trung bình (Mạng, phần mềm)', color: 'orange' },
    { value: 'HIGH', label: 'Cao (Máy không lên, cháy nổ)', color: 'red' },
  ];

  const columns: ColumnsType<Incident> = [
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => d ? d.split('T')[0] : '-'
    },
    {
      title: 'Vị trí',
      key: 'location',
      render: (_, record) => (
        <span>{record.roomName} - <strong>{record.computer?.computerCode ?? record.computerId}</strong></span>
      )
    },
    {
      title: 'Nội dung sự cố',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      render: (p: Priority) => {
        const opt = priorityOptions.find(o => o.value === p);
        return <Tag color={opt?.color}>{opt?.label}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <>
          {status === 'OPEN' && <Tag color="gold">ĐANG CHỜ</Tag>}
          {status === 'IN_PROGRESS' && <Tag color="processing">ĐANG XỬ LÝ</Tag>}
          {status === 'RESOLVED' && <Tag color="success">ĐÃ XỬ LÝ</Tag>}
        </>
      )
    },
  ];

  return (
    <Card
      title={<span><HistoryOutlined /> Lịch sử báo cáo sự cố</span>}
      extra={
        <Button
          type="primary"
          danger
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
        >
          Báo cáo sự cố mới
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={incidents}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={<span><AlertOutlined style={{ color: '#ff4d4f' }} /> Tạo báo cáo sự cố mới</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        okText="Gửi báo cáo"
        okButtonProps={{ danger: true }}
        cancelText="Hủy bỏ"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roomId" label="Phòng máy" rules={[{ required: true, message: 'Chọn phòng máy' }]}>
                <Select placeholder="Chọn phòng" onChange={handleRoomChange}>
                  {rooms.map(r => (
                    <Select.Option key={r.id} value={r.id}>{r.roomName}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="computerId" label="Máy tính gặp lỗi" rules={[{ required: true, message: 'Chọn mã máy' }]}>
                <Select placeholder="Chọn mã máy" disabled={computers.length === 0}>
                  {computers.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      <DesktopOutlined /> {c.computerCode}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="priority" label="Mức độ nghiêm trọng" initialValue="LOW">
            <Select>
              {priorityOptions.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết sự cố"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả lỗi' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Máy tính số 05 bị màn hình xanh, không khởi động được vào Windows..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default IncidentReport;
