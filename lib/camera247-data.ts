/**
 * Camera 247 Huế - Data Types, Services Catalog, Sample Data & Store
 */

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  type: 'individual' | 'business'
  idcard?: string
  notes?: string
  total_orders?: number
  total_spent?: number
  created_at: string
}

export interface InstallationOrder {
  id: string
  order_code: string
  customer_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  services: string[] // e.g. ['camera', 'smart_lock', 'wifi']
  equipment_list: string
  installation_date: string // DD/MM/YYYY or YYYY-MM-DD
  completion_date?: string
  warranty_months: number // 12, 24, 36...
  warranty_until: string // DD/MM/YYYY
  total_amount: number
  deposit_amount: number
  status: 'survey' | 'pending' | 'in_progress' | 'completed' | 'warranty' | 'cancelled'
  technician: string // Tước, Lập, KTV
  notes?: string
  created_at: string
  updated_at?: string
}

export interface AccessLog {
  id: string
  username: string
  displayName: string
  action: string // 'Đăng nhập', 'Đăng xuất', 'Thêm mới', 'Chỉnh sửa', 'Xóa', 'Sao lưu', 'Khôi phục'
  module: string // 'Đơn hàng', 'Khách hàng', 'Bài viết', 'Hệ thống & Đăng nhập', 'Cài đặt & Sao lưu', 'Khách xem Web'
  details: string
  ip_address?: string
  timestamp: string
}

export interface ServiceDefinition {
  id: string
  name: string
  category: string
  icon: string
  color: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
}

export const CAMERA247_SERVICES: ServiceDefinition[] = [
  {
    id: 'camera',
    name: 'Camera Quan Sát / AI',
    category: 'Giám sát',
    icon: 'Camera',
    color: 'text-blue-500',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/20',
  },
  {
    id: 'smart_lock',
    name: 'Khóa Cửa Vân Tay / Thông Minh',
    category: 'Kiểm soát',
    icon: 'Lock',
    color: 'text-amber-500',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
  },
  {
    id: 'wifi',
    name: 'Mạng Wifi Chuyên Dụng / Mesh',
    category: 'Hạ tầng',
    icon: 'Wifi',
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
  },
  {
    id: 'alarm',
    name: 'Báo Động & Chống Trộm',
    category: 'Cảnh báo',
    icon: 'Bell',
    color: 'text-rose-500',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/20',
  },
  {
    id: 'time_attendance',
    name: 'Máy Chấm Công & Kiểm Soát Vào Ra',
    category: 'Doanh nghiệp',
    icon: 'Fingerprint',
    color: 'text-purple-500',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/20',
  },
  {
    id: 'it_network',
    name: 'Máy Tính & Mạng Nội Bộ (LAN/Server)',
    category: 'IT Văn Phòng',
    icon: 'Server',
    color: 'text-cyan-500',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/20',
  },
]

export const ORDER_STATUS_CONFIG = {
  survey: {
    label: 'Khảo sát / Báo giá',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-400',
  },
  pending: {
    label: 'Chờ thi công',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dotClass: 'bg-sky-400',
  },
  in_progress: {
    label: 'Đang thi công',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dotClass: 'bg-blue-400 animate-pulse',
  },
  completed: {
    label: 'Đã bàn giao',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  warranty: {
    label: 'Đang bảo hành',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dotClass: 'bg-rose-400',
  },
} as const

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    name: 'Khách sạn Hương Giang Riverside',
    phone: '0234 382 1222',
    address: '51 Lê Lợi, P. Phú Hội, TP. Huế',
    type: 'business',
    notes: 'Hệ thống 32 Camera Dahua AI + Wifi Aruba chịu tải cao cho 8 tầng',
    total_orders: 3,
    total_spent: 68500000,
    created_at: '2025-11-15T08:30:00Z',
  },
  {
    id: 'cust-02',
    name: 'Anh Hoàng Đình Long (Biệt thự An Cựu City)',
    phone: '0914 552 889',
    address: 'Khu đô thị An Cựu City, P. An Đông, TP. Huế',
    type: 'individual',
    notes: 'Lắp khóa vân tay cửa đại sảnh + 6 camera 4K Full Color chống ngược sáng',
    total_orders: 2,
    total_spent: 24800000,
    created_at: '2026-01-10T10:15:00Z',
  },
  {
    id: 'cust-03',
    name: 'Công ty CP Xây Dựng & TM Cố Đô',
    phone: '0905 123 789',
    address: '124 Hùng Vương, P. Phú Nhuận, TP. Huế',
    type: 'business',
    notes: 'Máy chấm công khuôn mặt FaceID + Camera văn phòng',
    total_orders: 1,
    total_spent: 14200000,
    created_at: '2026-02-05T14:20:00Z',
  },
  {
    id: 'cust-04',
    name: 'Chị Mai Lan (Nhà hàng Cơm Niêu Phố Cổ)',
    phone: '0988 776 543',
    address: '38 Nguyễn Thái Học, P. Phú Hội, TP. Huế',
    type: 'business',
    notes: 'Camera thu âm quầy thu ngân + Wifi bán hàng Pos',
    total_orders: 2,
    total_spent: 18900000,
    created_at: '2026-02-18T09:00:00Z',
  },
  {
    id: 'cust-05',
    name: 'Bác Trần Văn Thịnh (Nhà phố Tây Lộc)',
    phone: '0935 441 223',
    address: '89 Thái Phiên, P. Tây Lộc, TP. Huế',
    type: 'individual',
    notes: 'Combo 4 mắt camera gia đình + báo động hồng ngoại',
    total_orders: 1,
    total_spent: 6500000,
    created_at: '2026-03-01T15:45:00Z',
  },
  {
    id: 'cust-06',
    name: 'Trường Mầm Non Họa Mi Huế',
    phone: '0234 352 9988',
    address: '15 Nguyễn Trãi, P. Thuận Hòa, TP. Huế',
    type: 'business',
    notes: 'Hệ thống 16 camera giám sát lớp học cho phụ huynh xem trực tuyến',
    total_orders: 2,
    total_spent: 32000000,
    created_at: '2026-03-08T11:20:00Z',
  },
  {
    id: 'cust-07',
    name: 'Anh Nguyễn Hữu Đạt (Kho xưởng Hương Thủy)',
    phone: '0903 512 888',
    address: 'KCN Phú Bài, TX. Hương Thủy, TT. Huế',
    type: 'business',
    notes: 'Camera PTZ quay quét 360 + Báo trộm rào chắn beam quang điện',
    total_orders: 1,
    total_spent: 28500000,
    created_at: '2026-03-12T16:00:00Z',
  },
]

export const SAMPLE_ORDERS: InstallationOrder[] = [
  {
    id: 'ord-01',
    order_code: 'C247-2026-001',
    customer_id: 'cust-01',
    customer_name: 'Khách sạn Hương Giang Riverside',
    customer_phone: '0234 382 1222',
    customer_address: '51 Lê Lợi, P. Phú Hội, TP. Huế',
    services: ['camera', 'wifi'],
    equipment_list: '32 Camera IP Dahua AI 4MP Full-color + Đầu ghi NVR 32 kênh 2 ổ cứng 4TB + 8 AP Wifi Ruijie Mesh',
    installation_date: '15/11/2025',
    completion_date: '18/11/2025',
    warranty_months: 24,
    warranty_until: '18/11/2027',
    total_amount: 52000000,
    deposit_amount: 52000000,
    status: 'warranty',
    technician: 'Lập & Tước',
    notes: 'Khách yêu cầu đi dây âm trần thẩm mỹ 100%, bảo hành định kỳ 6 tháng/lần',
    created_at: '2025-11-15T08:30:00Z',
  },
  {
    id: 'ord-02',
    order_code: 'C247-2026-002',
    customer_id: 'cust-02',
    customer_name: 'Anh Hoàng Đình Long (Biệt thự An Cựu City)',
    customer_phone: '0914 552 889',
    customer_address: 'Khu đô thị An Cựu City, P. An Đông, TP. Huế',
    services: ['camera', 'smart_lock'],
    equipment_list: '01 Khóa Kaadas S500-C nhận diện vân tay FPC + 06 Camera KBVISION 4K Ultra HD + HDD 2TB',
    installation_date: '12/01/2026',
    completion_date: '13/01/2026',
    warranty_months: 24,
    warranty_until: '13/01/2028',
    total_amount: 24800000,
    deposit_amount: 24800000,
    status: 'warranty',
    technician: 'Lập',
    notes: 'Đã bàn giao chìa cơ + 2 thẻ từ + hướng dẫn app quản lý mở từ xa',
    created_at: '2026-01-10T10:15:00Z',
  },
  {
    id: 'ord-03',
    order_code: 'C247-2026-003',
    customer_id: 'cust-03',
    customer_name: 'Công ty CP Xây Dựng & TM Cố Đô',
    customer_phone: '0905 123 789',
    customer_address: '124 Hùng Vương, P. Phú Nhuận, TP. Huế',
    services: ['time_attendance', 'it_network'],
    equipment_list: '02 Máy chấm công khuôn mặt & vân tay Ronald Jack FA210 + Cài đặt phần mềm tính lương',
    installation_date: '06/02/2026',
    completion_date: '06/02/2026',
    warranty_months: 12,
    warranty_until: '06/02/2027',
    total_amount: 14200000,
    deposit_amount: 14200000,
    status: 'warranty',
    technician: 'Tước',
    notes: 'Đã xuất hóa đơn VAT điện tử gửi qua email kế toán',
    created_at: '2026-02-05T14:20:00Z',
  },
  {
    id: 'ord-04',
    order_code: 'C247-2026-004',
    customer_id: 'cust-04',
    customer_name: 'Chị Mai Lan (Nhà hàng Cơm Niêu Phố Cổ)',
    customer_phone: '0988 776 543',
    customer_address: '38 Nguyễn Thái Học, P. Phú Hội, TP. Huế',
    services: ['camera', 'wifi'],
    equipment_list: '08 Camera Hikvision ColorVu có Mic thu âm + 02 Switch PoE 8 cổng + 03 Router Wifi phát rộng',
    installation_date: '20/02/2026',
    completion_date: '21/02/2026',
    warranty_months: 24,
    warranty_until: '21/02/2028',
    total_amount: 18900000,
    deposit_amount: 18900000,
    status: 'completed',
    technician: 'Đội Kỹ thuật 1',
    notes: 'Camera thu âm rõ ràng tại quầy tính tiền',
    created_at: '2026-02-18T09:00:00Z',
  },
  {
    id: 'ord-05',
    order_code: 'C247-2026-005',
    customer_id: 'cust-06',
    customer_name: 'Trường Mầm Non Họa Mi Huế',
    customer_phone: '0234 352 9988',
    customer_address: '15 Nguyễn Trãi, P. Thuận Hòa, TP. Huế',
    services: ['camera'],
    equipment_list: '16 Camera IP góc siêu rộng Dahua 2K + NVR 16 kênh + Thiết lập tài khoản phân quyền từng lớp',
    installation_date: '10/03/2026',
    completion_date: '12/03/2026',
    warranty_months: 24,
    warranty_until: '12/03/2028',
    total_amount: 32000000,
    deposit_amount: 20000000,
    status: 'in_progress',
    technician: 'Lập & Tước',
    notes: 'Đang kéo dây nhánh phòng học tầng 2, dự kiến hoàn thành bàn giao vào 17h chiều',
    created_at: '2026-03-08T11:20:00Z',
  },
  {
    id: 'ord-06',
    order_code: 'C247-2026-006',
    customer_id: 'cust-07',
    customer_name: 'Anh Nguyễn Hữu Đạt (Kho xưởng Hương Thủy)',
    customer_phone: '0903 512 888',
    customer_address: 'KCN Phú Bài, TX. Hương Thủy, TT. Huế',
    services: ['camera', 'alarm'],
    equipment_list: '02 Camera Speed Dome PTZ zoom quang 25X + 04 Cảm biến hàng rào hồng ngoại BEAM 100m + Còi hú',
    installation_date: '24/03/2026',
    completion_date: '25/03/2026',
    warranty_months: 24,
    warranty_until: '25/03/2028',
    total_amount: 28500000,
    deposit_amount: 10000000,
    status: 'pending',
    technician: 'Tước',
    notes: 'Lịch thi công ngày mai lúc 8h sáng, vật tư đã chuẩn bị sẵn sàng',
    created_at: '2026-03-12T16:00:00Z',
  },
  {
    id: 'ord-07',
    order_code: 'C247-2026-007',
    customer_id: 'cust-05',
    customer_name: 'Bác Trần Văn Thịnh (Nhà phố Tây Lộc)',
    customer_phone: '0935 441 223',
    customer_address: '89 Thái Phiên, P. Tây Lộc, TP. Huế',
    services: ['camera'],
    equipment_list: 'Trọn gói 04 Camera Full HD Hikvision + Ổ cứng 1TB + Tặng hộp kỹ thuật & dây tín hiệu',
    installation_date: '23/03/2026',
    completion_date: '',
    warranty_months: 24,
    warranty_until: '23/03/2028',
    total_amount: 6500000,
    deposit_amount: 2000000,
    status: 'survey',
    technician: 'Lập',
    notes: 'Đã khảo sát vị trí góc sân và cổng, chuẩn bị lên phương án thi công',
    created_at: '2026-03-20T15:45:00Z',
  },
]

export const SAMPLE_LOGS: AccessLog[] = [
  {
    id: 'log-01',
    username: 'admin',
    displayName: 'Quản trị viên (Tước)',
    action: 'Đăng nhập',
    module: 'Hệ thống & Đăng nhập',
    details: 'Đăng nhập thành công từ IP 113.161.78.45 [Thiết bị: macOS Chrome]',
    ip_address: '113.161.78.45',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'log-02',
    username: 'admin',
    displayName: 'Quản trị viên (Tước)',
    action: 'Cập nhật',
    module: 'Đơn hàng',
    details: 'Cập nhật tiến độ đơn hàng #C247-2026-005 (Trường Mầm Non Họa Mi) → Đang thi công',
    ip_address: '113.161.78.45',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'log-03',
    username: 'admin1',
    displayName: 'Kỹ thuật viên (Lập)',
    action: 'Thêm mới',
    module: 'Khách hàng',
    details: 'Tạo hồ sơ khách hàng mới: Bác Trần Văn Thịnh (89 Thái Phiên, Tây Lộc)',
    ip_address: '14.238.12.90',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'log-04',
    username: 'visitor',
    displayName: 'Khách truy cập',
    action: 'Xem',
    module: 'Khách xem Web',
    details: 'Khách hàng xem công trình: Lắp đặt hệ thống camera an ninh AI tại TP. Huế',
    ip_address: '42.118.23.104',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'log-05',
    username: 'admin',
    displayName: 'Quản trị viên (Tước)',
    action: 'Sao lưu',
    module: 'Cài đặt & Sao lưu',
    details: 'Tạo bản sao lưu dữ liệu toàn hệ thống JSON thành công',
    ip_address: '113.161.78.45',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
]

const LOCAL_STORAGE_KEY_CUSTOMERS = 'c247_customers_data'
const LOCAL_STORAGE_KEY_ORDERS = 'c247_orders_data'
const LOCAL_STORAGE_KEY_LOGS = 'c247_logs_data'

export function getStoredCustomers(): Customer[] {
  if (typeof window === 'undefined') return SAMPLE_CUSTOMERS
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading stored customers', e)
  }
  return SAMPLE_CUSTOMERS
}

export function saveStoredCustomers(customers: Customer[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(customers))
  } catch (e) {
    console.error('Error saving stored customers', e)
  }
}

export function getStoredOrders(): InstallationOrder[] {
  if (typeof window === 'undefined') return SAMPLE_ORDERS
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading stored orders', e)
  }
  return SAMPLE_ORDERS
}

export function saveStoredOrders(orders: InstallationOrder[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders))
  } catch (e) {
    console.error('Error saving stored orders', e)
  }
}

export function getStoredLogs(): AccessLog[] {
  if (typeof window === 'undefined') return SAMPLE_LOGS
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading stored logs', e)
  }
  return SAMPLE_LOGS
}

export function saveStoredLogs(logs: AccessLog[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(logs))
  } catch (e) {
    console.error('Error saving stored logs', e)
  }
}

export function addAuditLog(
  username: string,
  displayName: string,
  action: string,
  module: string,
  details: string
) {
  if (typeof window === 'undefined') return
  const current = getStoredLogs()
  const newLog: AccessLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    username: username || 'admin',
    displayName: displayName || (username === 'admin1' ? 'Kỹ thuật viên (Lập)' : 'Quản trị viên (Tước)'),
    action,
    module,
    details,
    ip_address: '113.161.78.45',
    timestamp: new Date().toISOString(),
  }
  const updated = [newLog, ...current].slice(0, 200)
  saveStoredLogs(updated)
}
