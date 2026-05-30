import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Card, Modal, Form, DatePicker, TimePicker, Select, Input, message, Popconfirm } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { bookingApi, type Booking, type BookingStatus } from '../../api/booking';
import { roomApi, type Room } from '../../api/room';

const { RangePicker } = TimePicker;

export const statusMap: Record<BookingStatus, { color: string, text: string }> = {
  PENDING: { color: 'gold', text: 'Chờ duyệt' },
  APPROVED: { color: 'green', text: 'Đã duyệt' },
  REJECTED: { color: 'red', text: 'Từ chối' },
  CANCELLED: { color: 'gray', text: 'Đã hủy' },
};

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("id!=0");
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState(["id,desc"]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, roomRes] = await Promise.all([
        bookingApi.search({ filter, page: page, size, sort }),
        roomApi.getAll()
      ]);
      setBookings(bookRes.data.content);
      setRooms(roomRes.data);
      setTotal(bookRes.data.totalElements);
    } catch (error) {
      message.error('Lỗi tải dữ liệu mượn phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, size, filter, sort]);

  const handleCreateBooking = async (values: any) => {
    try {
      const payload = {
        roomId: values.roomId,
        bookingDate: values.bookingDate.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        purpose: values.purpose,
      };
      await bookingApi.create(payload);
      message.success('Gửi yêu cầu mượn phòng thành công');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error('Phòng đã có lịch vào thời gian này!');
    }
  };

  const updateStatus = async (id: number, status: 'approve' | 'reject') => {
    try {
      if (status === 'approve') await bookingApi.approve(id);
      else await bookingApi.reject(id);
      message.success('Đã cập nhật trạng thái');
      fetchData();
    } catch (error) { message.error('Thao tác thất bại'); }
  };

  const columns: ColumnsType<Booking> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_value, _record, index) => (page * size) + index + 1,
    },
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
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => updateStatus(record.id, 'approve')}
              > Duyệt </Button>
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => updateStatus(record.id, 'reject')}
              > Từ chối </Button>
            </>
          )}
          <Popconfirm title="Xóa yêu cầu này?" onConfirm={() => bookingApi.delete(record.id).then(fetchData)}>
            <Button type="text" danger icon={<PlusOutlined rotate={45} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ margin: '16px 16px' }}
      title="Danh sách đăng ký mượn phòng"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Đăng ký mượn</Button>}
    >
      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page + 1,
          pageSize: size,
          total,
          onChange: (page, pageSize) => {
            setPage(page - 1);
            setSize(pageSize);
          },
        }}
      />

      <Modal title="Đăng ký mượn phòng máy" open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleCreateBooking}>
          <Form.Item name="roomId" label="Chọn phòng máy" rules={[{ required: true }]}>
            <Select placeholder="Chọn phòng còn trống">
              {rooms.map(r => <Select.Option key={r.id} value={r.id}>{r.roomName} ({r.location})</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="bookingDate" label="Ngày mượn" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} minDate={dayjs()} />
          </Form.Item>
          <Form.Item name="timeRange" label="Khung giờ" rules={[{ required: true }]}>
            <RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="purpose" label="Lý do mượn / Tên môn học" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Ví dụ: Dạy bù môn Lập trình Java ca 2" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BookingManagement;