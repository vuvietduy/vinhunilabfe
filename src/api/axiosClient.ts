import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 1. Tạo instance của Axios
const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api', // Lấy từ biến môi trường hoặc mặc định
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây sẽ ngắt kết nối nếu server không phản hồi
});

// 2. Cấu hình Request Interceptor: Chạy trước khi request được gửi đi
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Nếu có token, gắn vào Header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Cấu hình Response Interceptor: Chạy sau khi nhận phản hồi từ Server
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về trực tiếp data để bên ngoài không cần .data nữa
    return response;
  },
  (error) => {
    // Xử lý lỗi tập trung
    if (error.response) {
      switch (error.response.status) {
        case 401: // Unauthorized: Token hết hạn hoặc không hợp lệ
          console.error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
          localStorage.clear(); // Xóa sạch dữ liệu cũ
          window.location.href = '/login'; // Điều hướng về trang login
          break;
        case 403: // Forbidden: Không có quyền truy cập
          console.error('Bạn không có quyền thực hiện hành động này.');
          break;
        case 500:
          console.error('Lỗi hệ thống phía Server.');
          break;
        default:
          console.error(error.response.data?.message || 'Có lỗi xảy ra.');
      }
    } else {
      console.error('Không thể kết nối đến máy chủ.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;