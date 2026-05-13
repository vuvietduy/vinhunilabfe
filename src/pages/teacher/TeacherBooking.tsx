import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, Space, Modal, Form, DatePicker, TimePicker, Select, Input, message } from 'antd';
import { PlusOutlined, HistoryOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { bookingApi, type BookingStatus } from '../../api/booking';
import { roomApi, type Room } from '../../api/room';

const { RangePicker } = TimePicker;

const TeacherBooking: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State cho phân trang và filter
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const [form] = Form.useForm();

  const fetchMyBookings = async (page = 1, size = 5, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings({
        page: page - 1, // Spring tính từ 0
        size: size,
        status: status
      });
      setData(res.data.content);
      setPagination({
        ...pagination,
        current: page,
        total: res.data.totalElements
      });
    } catch (error) {
      message.error('Không thể tải lịch sử mượn phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
    roomApi.getAll().then(res => setRooms(res.data));
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchMyBookings(newPagination.current, newPagination.pageSize);
  };

  const handleCreate = async (values: any) => {

    try {

      const bookingDate =
        values.bookingDate.format('YYYY-MM-DD');

      const start =
        values.timeRange[0].format('HH:mm:ss');

      const end =
        values.timeRange[1].format('HH:mm:ss');
      console.log(values)

      const payload = {
        room: { id: values.roomId },
        startTime: `${bookingDate}T${start}`,
        endTime: `${bookingDate}T${end}`,
        purpose: values.purpose
      };


      await bookingApi.create(payload);

      message.success(
        'Đã gửi yêu cầu mượn phòng!'
      );

      form.resetFields();

      setIsModalOpen(false);

      fetchMyBookings(1);

    } catch (error: any) {

      message.error(
        error.response?.data?.message ||
        'Có lỗi xảy ra!'
      );
    }
  };

  const statusMap: Record<BookingStatus, { color: string, text: string }> = {
    PENDING: { color: 'gold', text: 'Đang chờ' },
    APPROVED: { color: 'green', text: 'Đã duyệt' },
    REJECTED: { color: 'red', text: 'Từ chối' },
    CANCELLED: { color: 'gray', text: 'Đã hủy' },
  };

  const columns = [
    { title: 'Phòng', dataIndex: ['room', 'roomName'], key: 'roomName' },
    { title: 'Ngày mượn', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Khung giờ',
      key: 'time',
      render: (record: any) => `${record.startTime} - ${record.endTime}`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: BookingStatus) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (record: any) => (
        record.status === 'PENDING' && (
          <Button
            danger
            size="small"
            icon={<StopOutlined />}
            onClick={() => bookingApi.cancel(record.id).then(() => fetchMyBookings())}
          >
            Hủy yêu cầu
          </Button>
        )
      )
    }
  ];

  return (
    <Card
      title={<span><HistoryOutlined /> Lịch sử mượn phòng của tôi</span>}
      extra={
        <Space>
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            style={{ width: 150 }}
            onChange={(val) => { setStatusFilter(val); fetchMyBookings(1, 5, val); }}
          >
            <Select.Option value="PENDING">Chờ duyệt</Select.Option>
            <Select.Option value="APPROVED">Đã duyệt</Select.Option>
            <Select.Option value="REJECTED">Từ chối</Select.Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Đăng ký mượn phòng
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title="Đăng ký lịch dạy / Mượn phòng"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi yêu cầu"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="roomId" label="Phòng máy" rules={[{ required: true }]}>
            <Select>
              {rooms.map(r => <Select.Option key={r.id} value={r.id}>{r.roomName}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="bookingDate" label="Ngày" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} minDate={dayjs()} />
          </Form.Item>
          <Form.Item name="timeRange" label="Thời gian" rules={[{ required: true }]}>
            <RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="purpose" label="Mục đích sử dụng" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Ví dụ: Dạy bù môn Kỹ thuật lập trình" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TeacherBooking;