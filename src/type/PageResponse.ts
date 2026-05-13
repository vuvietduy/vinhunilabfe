export interface PageResponse<T> {
  content: T[];           // Danh sách dữ liệu thực tế (ví dụ: User[], Room[])
  totalPages: number;     // Tổng số trang
  totalElements: number;  // Tổng số bản ghi trong database
  size: number;           // Số bản ghi trên mỗi trang
  number: number;         // Trang hiện tại (Spring Boot bắt đầu từ 0)
  last: boolean;          // Có phải trang cuối không
  first: boolean;         // Có phải trang đầu không
  empty: boolean;         // Dữ liệu có trống không
}