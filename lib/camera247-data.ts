/**
 * Camera 247 Huế - Data Types, Services Catalog, Sample Data & Store
 */

export interface Customer {
  id: string
  name: string
  phone: string
  phone_secondary?: string
  zalo?: string
  email?: string
  address: string
  district?: string // 'TP. Huế (Trung tâm)' | 'KCN Phú Bài - Hương Thủy' | 'TX. Hương Trà' | 'Huyện Phú Vang' | 'Huyện Phú Lộc' | 'Huyện Phong Điền' | 'Khu vực khác'
  type: 'individual' | 'business'
  tier?: 'standard' | 'vip' | 'potential'
  tax_code?: string
  idcard?: string
  notes?: string
  total_orders?: number
  total_spent?: number
  created_at: string
  updated_at?: string
}

export const HUE_DISTRICTS = [
  'TP. Huế (Trung tâm)',
  'KCN Phú Bài - Hương Thủy',
  'TX. Hương Trà',
  'Huyện Phú Vang',
  'Huyện Phú Lộc',
  'Huyện Phong Điền - Quảng Điền',
  'Khu vực khác (TT. Huế)',
] as const

export const CUSTOMER_TIERS = {
  standard: { label: 'Tiêu chuẩn', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  potential: { label: 'Tiềm năng', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  vip: { label: 'VIP ⭐', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' },
} as const

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

export const SAMPLE_CUSTOMERS: Customer[] = []

export const SAMPLE_ORDERS: InstallationOrder[] = []

export const SAMPLE_LOGS: AccessLog[] = []


export const SAMPLE_CATEGORIES: { id: string; name: string; slug: string; description: string; icon: string; created_at: string }[] = [
  {
    id: 'cat-01',
    name: 'Camera Quan Sát & AI',
    slug: 'camera-quan-sat',
    description: 'Hệ thống camera giám sát an ninh độ nét cao, camera AI nhận diện khuôn mặt, biển số và cảnh báo chủ động',
    icon: 'Camera',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-02',
    name: 'Khóa Cửa Thông Minh & Vân Tay',
    slug: 'khoa-cua-thong-minh',
    description: 'Khóa vân tay, thẻ từ, mã số, nhận diện gương mặt FaceID cao cấp cho biệt thự, căn hộ và văn phòng',
    icon: 'Lock',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-03',
    name: 'Hạ Tầng Mạng & Wifi Chuyên Dụng',
    slug: 'mang-wifi-chuyen-dung',
    description: 'Hệ thống mạng LAN, Wifi Mesh chịu tải cao cho nhà hàng, khách sạn, quán cafe, văn phòng tại Huế',
    icon: 'Wifi',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-04',
    name: 'Báo Động & Nhà Thông Minh',
    slug: 'bao-dong-thong-minh',
    description: 'Hệ thống chống trộm, cảm biến hồng ngoại, chuông cửa có hình và tự động hóa nhà thông minh',
    icon: 'Bell',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-05',
    name: 'Máy Chấm Công & Kiểm Soát Ra Vào',
    slug: 'may-cham-cong',
    description: 'Thiết bị chấm công vân tay, khuôn mặt AI, phần mềm quản lý chấm công và kiểm soát phân quyền',
    icon: 'Clock',
    created_at: '2026-01-01T00:00:00Z',
  },
]

export const SAMPLE_POSTS = [
  {
    id: 'post-01',
    title: 'Lắp Đặt Hệ Thống 32 Camera Giám Sát Khách Sạn Hương Giang Huế',
    slug: 'lap-dat-32-camera-khach-san-huong-giang-hue',
    content: `# Giới Thiệu Dự Án
Khách sạn Hương Giang Resort & Spa (51 Lê Lợi, TP. Huế) là một trong những khu nghỉ dưỡng danh tiếng bên bờ sông Hương. Nhằm nâng cấp tiêu chuẩn an ninh 5 sao và quản lý toàn diện khu vực sảnh, hành lang, bãi xe và khuôn viên bờ sông, ban quản lý đã tin tưởng lựa chọn **Camera 247 Huế** làm đơn vị tổng thầu thi công trọn gói.

# Giải Pháp Kỹ Thuật Đã Triển Khai
- Trang bị **32 Camera IP Hikvision 4.0MP ColorVu** có màu 24/24 ban đêm, tích hợp mic thu âm đa hướng.
- Đầu ghi hình NVR 32 kênh 4K chuẩn nén H.265+ kèm ổ cứng chuyên dụng lưu trữ 30 ngày liên tục.
- Hệ thống tủ rack trung tâm, switch PoE chuyên dụng và đường dây cáp mạng Cat6 chống nhiễu đạt chuẩn công nghiệp.
- Cài đặt hệ thống phân quyền giám sát tập trung tại phòng an ninh và truyền dữ liệu qua điện thoại cho ban giám đốc.

# Kết Quả Nghiệm Thu & Đánh Giá
Toàn bộ hệ thống được bàn giao đúng tiến độ 3 ngày, hình ảnh cực kỳ sắc nét cả ngày lẫn đêm, đường dây được luồn ống gen thẩm mỹ, đảm bảo tuyệt đối vẻ đẹp kiến trúc sang trọng của khách sạn.`,
    excerpt: 'Triển khai trọn gói 32 camera IP ColorVu có màu ban đêm, đầu ghi 32 kênh 4K và tủ mạng trung tâm cho Hương Giang Resort & Spa bên bờ sông Hương.',
    cover_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 'cat-01',
    category: SAMPLE_CATEGORIES[0],
    location: '51 Lê Lợi, P. Phú Hội, TP. Huế',
    client_name: 'Khách sạn Hương Giang Resort & Spa',
    completed_at: '2026-01-15',
    featured: true,
    published: true,
    created_at: '2026-01-15T08:30:00Z',
    updated_at: '2026-01-15T16:45:00Z',
  },
  {
    id: 'post-02',
    title: 'Triển Khai Khóa Cửa Vân Tay Nhận Diện FaceID Cho Biệt Thự An Cựu City',
    slug: 'lap-dat-khoa-van-tay-faceid-biet-thu-an-cuu-city-hue',
    content: `# Nhu Cầu Của Gia Chủ
Gia đình anh Hoàng Đăng Khoa tại KĐT An Cựu City mong muốn sở hữu một hệ thống khóa cửa thông minh cao cấp nhất hiện nay cho cửa chính gỗ lim và hệ thống khóa thẻ từ cho các phòng ngủ, đảm bảo an toàn vượt trội, mở khóa nhanh không cần chìa khóa cơ truyền thống và quản lý từ xa qua smartphone.

# Giải Pháp Khóa Thông Minh Được Lựa Chọn
- Cửa chính: Lắp đặt khóa thông minh **Kaadas K20 Pro Max 3D FaceID** tích hợp camera quan sát chuông hình góc rộng, mở bằng khuôn mặt 3D, vân tay bán dẫn FPC Thụy Điển, mã số ảo và app điện thoại WiFi.
- Các phòng ngủ & ban công: Khóa tay gạt vân tay thông minh Philips DDL603E chống cạy phá.
- Tích hợp cảnh báo đột nhập tức thời và thông báo trạng thái đóng/mở cửa trực tiếp về điện thoại gia chủ.

# Bàn Giao & Hướng Dẫn Sử Dụng
Kỹ thuật viên Camera 247 Huế đã hoàn tất lắp đặt tỉ mỉ, đục khoét chuẩn xác trên nền gỗ lim, cài đặt vân tay/khuôn mặt cho tất cả thành viên trong gia đình và kích hoạt gói bảo hành tận nơi 24 tháng.`,
    excerpt: 'Lắp đặt khóa FaceID 3D tích hợp chuông cửa màn hình Kaadas K20 Pro Max cho cửa chính biệt thự gỗ lim tại Khu Đô Thị An Cựu City, TP. Huế.',
    cover_image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 'cat-02',
    category: SAMPLE_CATEGORIES[1],
    location: 'Khu Đô Thị An Cựu City, TP. Huế',
    client_name: 'Anh Hoàng Đăng Khoa',
    completed_at: '2026-02-02',
    featured: true,
    published: true,
    created_at: '2026-02-02T09:00:00Z',
    updated_at: '2026-02-02T15:20:00Z',
  },
  {
    id: 'post-03',
    title: 'Thi Công Hệ Thống Mạng Wifi Mesh Chịu Tải Quán Cafe The Time Hùng Vương',
    slug: 'thi-cong-wifi-chiu-tai-cafe-the-time-hung-vuong-hue',
    content: `# Hiện Trạng & Thách Thức
The Time Coffee Lounge tại 18 Hùng Vương là điểm đến quen thuộc của giới trẻ và dân văn phòng tại Huế với lưu lượng khách giờ cao điểm lên tới hơn 150 người truy cập đồng thời. Hệ thống modem nhà mạng cũ thường xuyên bị nghẽn mạng, rớt kết nối và khách phàn nàn về tốc độ wifi.

# Giải Pháp Hạ Tầng Mạng Do Camera 247 Huế Triển Khai
- Lắp đặt **Router Cân Bằng Tải DrayTek Vigor2927** hỗ trợ gộp 2 đường truyền Internet tốc độ cao, phân tải thông minh và bảo mật QoS.
- Phủ sóng toàn bộ 2 tầng và sân vườn bằng **4 Bộ phát Wifi Ruijie Reyee RG-RAP2200(E)** chuẩn Wifi 6, hỗ trợ Roaming liền mạch không gián đoạn kết nối khi di chuyển.
- Phân tách 3 dải mạng độc lập: Mạng Quản lý & Thu ngân POS (ưu tiên băng thông cao nhất), Mạng Nhân viên và Mạng Khách hàng (có trang chào Marketing).

# Đánh Giá Hiệu Năng Sau Nghiệm Thu
Kiểm tra thực tế với hơn 160 thiết bị online cùng lúc cho tốc độ download/upload luôn đạt trên 95Mbps tại mọi góc ngồi, độ trễ ping dưới 5ms, giải quyết dứt điểm tình trạng gián đoạn mạng.`,
    excerpt: 'Nâng cấp toàn diện mạng Wifi 6 chịu tải 200+ user với Router DrayTek cân bằng tải và 4 bộ phát Ruijie Mesh cho The Time Coffee Lounge Huế.',
    cover_image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 'cat-03',
    category: SAMPLE_CATEGORIES[2],
    location: '18 Hùng Vương, TP. Huế',
    client_name: 'The Time Coffee Lounge',
    completed_at: '2026-02-20',
    featured: true,
    published: true,
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T17:30:00Z',
  },
  {
    id: 'post-04',
    title: 'Hệ Thống Camera An Ninh & Máy Chấm Công Khuôn Mặt AI Nhà Xưởng May Phú Bài',
    slug: 'camera-an-ninh-may-cham-cong-khuon-mat-nha-xuong-may-phu-bai',
    content: `# Quy Mô Dự Án Nhà Xưởng
Công ty May Xuất Khẩu Phú Bài tại Khu Công Nghiệp Phú Bài (Hương Thủy, TT. Huế) có diện tích sản xuất hơn 3.500m2 với hơn 200 công nhân. Yêu cầu đặt ra là giám sát chặt chẽ chuyền may, kho vải, bãi xuất nhập hàng và tự động hóa quy trình chấm công tránh tình trạng gian lận bấm hộ.

# Hạng Mục Kỹ Thuật Đã Hoàn Thành
- **16 Camera Thân Trụ Dahua Full HD 2.0MP** chuẩn chống nước IP67 chuyên dụng cho môi trường công nghiệp nhiều bụi bẩn.
- Cáp mạng quang chuyên dụng kết nối khoảng cách xa hơn 300 mét giữa văn phòng quản lý và xưởng 2.
- **2 Máy Chấm Công Khuôn Mặt AI Hikvision DS-K1T342MFX** nhận diện chỉ trong 0.2 giây, nhận diện chính xác kể cả khi công nhân đeo khẩu trang.
- Cài đặt phần mềm tính công tự động xuất bảng chấm công Excel hàng tháng liên kết trực tiếp phòng nhân sự.

# Bàn Giao & Vận Hành
Hệ thống vận hành mượt mà, giúp ban giám đốc giảm 80% thời gian xử lý dữ liệu chấm công thủ công và nâng cao ý thức làm việc của toàn thể cán bộ công nhân viên.`,
    excerpt: 'Triển khai 16 camera an ninh nhà xưởng kết hợp hệ thống 2 máy chấm công nhận diện FaceID AI và phần mềm tính công tự động cho nhà máy may tại KCN Phú Bài.',
    cover_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 'cat-05',
    category: SAMPLE_CATEGORIES[4],
    location: 'Đường số 3, KCN Phú Bài, TX. Hương Thủy',
    client_name: 'Công ty May Xuất Khẩu Phú Bài',
    completed_at: '2026-03-05',
    featured: false,
    published: true,
    created_at: '2026-03-05T08:00:00Z',
    updated_at: '2026-03-05T16:00:00Z',
  },
  {
    id: 'post-05',
    title: 'Lắp Đặt Trọn Gói Bộ 4 Camera Dahua Full Color Có Màu Ban Đêm Cho Hộ Gia Đình',
    slug: 'lap-dat-4-camera-dahua-full-color-nha-pho-chi-lang-hue',
    content: `# Yêu Cầu Của Khách Hàng
Gia đình Chú Nghĩa tại đường Chi Lăng (P. Phú Cát, TP. Huế) cần lắp đặt camera để quan sát khu vực cổng trước, sân vườn, phòng khách và ban công tầng 2 để an tâm khi đi làm xa và chăm sóc ông bà lớn tuổi ở nhà.

# Trọn Bộ Thiết Bị Được Lắp Đặt
- **4 Mắt Camera Dahua Full Color 2.0MP** tích hợp đèn LED trợ sáng xem hình ảnh có màu sắc sống động suốt đêm 24/24.
- Đầu ghi hình 4 kênh chuẩn nén hình ảnh siêu tiết kiệm dung lượng, ổ cứng Western Digital Purple 1TB chuyên dụng camera.
- Nguồn cấp điện tử chống sét, jack BNC đồng nguyên chất và hộp kỹ thuật bảo vệ mối nối thẩm mỹ.
- Cài đặt ứng dụng DMSS tiếng Việt trên 4 điện thoại của các thành viên trong gia đình.

# Tiến Độ Hoàn Thành & Bảo Hành
Thi công hoàn tất và bàn giao chỉ trong 4 giờ làm việc. Đường dây được nẹp gen vuông trắng gọn gàng theo mép tường. Cam kết bảo hành chính hãng tận nơi 24 tháng 1 đổi 1.`,
    excerpt: 'Giải pháp bảo vệ an ninh trọn gói cho nhà phố: 4 mắt camera Dahua Full Color xem đêm có màu, lưu trữ 15 ngày và xem trực tiếp trên điện thoại mượt mà.',
    cover_image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 'cat-01',
    category: SAMPLE_CATEGORIES[0],
    location: 'Đường Chi Lăng, P. Phú Cát, TP. Huế',
    client_name: 'Gia đình Chú Trần Hữu Nghĩa',
    completed_at: '2026-03-18',
    featured: false,
    published: true,
    created_at: '2026-03-18T14:00:00Z',
    updated_at: '2026-03-18T18:00:00Z',
  },
]

export const POST_TEMPLATES = [
  {
    id: 'tpl-camera-home',
    title: 'Camera Gia Đình / Nhà Phố',
    description: 'Lắp đặt camera hộ gia đình, nhà ống, nhà vườn tại Huế',
    category_id: 'cat-01',
    excerpt: 'Triển khai giải pháp camera quan sát an ninh có màu ban đêm cho hộ gia đình tại Huế, giám sát 24/7 trên điện thoại.',
    content: `# Giới Thiệu Công Trình
Hộ gia đình tại khu vực TP. Huế có nhu cầu bảo vệ tài sản, giám sát an ninh khu vực cổng trước, sân để xe và phòng sinh hoạt chung của gia đình.

# Chi Tiết Thiết Bị Triển Khai
- Hệ thống camera quan sát độ nét cao (2.0MP / 4.0MP) có màu ban đêm và thu âm thanh rõ nét.
- Đầu ghi hình và ổ cứng chuyên dụng lưu trữ dữ liệu an toàn từ 15 - 30 ngày.
- Nẹp gen vuông chống nước, thẩm mỹ tuyệt đối theo kiến trúc ngôi nhà.
- Cài đặt phần mềm xem camera qua điện thoại/máy tính cho các thành viên trong gia đình.

# Đánh Giá & Bàn Giao
Công trình được bàn giao đúng hạn, hình ảnh sắc nét, khách hàng hài lòng và cam kết bảo hành chính hãng tận nơi 24 tháng.`,
  },
  {
    id: 'tpl-camera-enterprise',
    title: 'Camera Khách Sạn / Doanh Nghiệp',
    description: 'Dự án quy mô lớn, nhà xưởng, khách sạn, resort',
    category_id: 'cat-01',
    excerpt: 'Lắp đặt hệ thống camera IP giám sát tập trung chuẩn công nghiệp cho đơn vị doanh nghiệp / khách sạn tại Thừa Thiên Huế.',
    content: `# Nhu Cầu & Khảo Sát Dự Án
Doanh nghiệp / Khách sạn cần hệ thống giám sát an ninh toàn diện với số lượng lớn camera, yêu cầu đường truyền ổn định và quản lý phân quyền tập trung.

# Phương Án Kỹ Thuật Đã Thực Hiện
- Triển khai hệ thống camera IP chuẩn nén H.265+ kết hợp switch PoE chuyên dụng.
- Tủ rack trung tâm, đầu ghi hình NVR đa kênh 4K và hệ thống lưu trữ dự phòng.
- Thi công cáp mạng Cat6 chống nhiễu đạt tiêu chuẩn công trình chuyên nghiệp.
- Thiết lập màn hình giám sát trung tâm tại phòng trực an ninh và kết nối mạng nội bộ.

# Kết Quả Bàn Giao
Hệ thống vận hành trơn tru, phủ kín các góc trọng yếu, đảm bảo an toàn tuyệt đối cho tài sản và khách hàng của doanh nghiệp.`,
  },
  {
    id: 'tpl-smart-lock',
    title: 'Khóa Cửa Vân Tay / FaceID',
    description: 'Lắp đặt khóa điện tử căn hộ, biệt thự, văn phòng',
    category_id: 'cat-02',
    excerpt: 'Nâng cấp khóa cửa thông minh mở bằng FaceID / Vân tay / Thẻ từ / App điện thoại, bảo mật đỉnh cao và tiện lợi.',
    content: `# Nhu Cầu Khách Hàng
Khách hàng muốn thay thế khóa cơ truyền thống sang khóa cửa thông minh cao cấp để tiện lợi ra vào, không lo quên chìa và nâng cao tính bảo mật.

# Giải Pháp Khóa Lắp Đặt
- Lắp đặt khóa cửa thông minh đa phương thức mở khóa: Nhận diện khuôn mặt 3D, Vân tay siêu nhạy FPC, Mã số ảo chống nhìn trộm, Thẻ từ và Chìa cơ dự phòng.
- Thân khóa inox 304 nguyên khối chống cạy phá, có chuông hình và kết nối ứng dụng điện thoại.
- Đục khoét chuẩn xác và hoàn thiện tinh tế trên bề mặt cửa.

# Hướng Dẫn & Cam Kết
Hướng dẫn tận tình các chức năng mở khóa, cài đặt thành viên và chế độ bảo hành tận nơi 24 tháng chính hãng.`,
  },
  {
    id: 'tpl-wifi-network',
    title: 'Hạ Tầng Wifi Chuyên Dụng / Cafe / VP',
    description: 'Thi công mạng LAN, Wifi Mesh chịu tải cao',
    category_id: 'cat-03',
    excerpt: 'Thi công hệ thống Router cân bằng tải và Wifi Mesh chịu tải 100-300 user đồng thời cho quán cafe / nhà hàng / văn phòng.',
    content: `# Hiện Trạng Mạng & Thách Thức
Địa điểm kinh doanh thường xuyên gặp tình trạng nghẽn mạng giờ cao điểm, khách hàng không truy cập được wifi hoặc bị ngắt kết nối khi di chuyển.

# Giải Pháp Nâng Cấp
- Trang bị Router cân bằng tải chuyên dụng chịu tải cao, gộp nhiều đường truyền Internet.
- Lắp đặt hệ thống bộ phát Wifi 6 chuẩn Mesh công nghiệp, Roaming mượt mà không rớt mạng.
- Tách riêng đường truyền cho phần mềm bán hàng POS, nhân viên và khách hàng với trang chào Marketing chuyên nghiệp.

# Nghiệm Thu Hiệu Năng
Tốc độ mạng ổn định vượt trội, phủ sóng đều khắp mọi khu vực, đáp ứng hoàn hảo cho hàng trăm thiết bị cùng lúc.`,
  },
]

const LOCAL_STORAGE_KEY_CUSTOMERS = 'c247_customers_v4'
const LOCAL_STORAGE_KEY_ORDERS = 'c247_orders_v4'
const LOCAL_STORAGE_KEY_LOGS = 'c247_logs_v4'

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
    displayName: displayName || (username === 'admin1' ? 'Quản trị viên (Tước)' : 'Quản trị viên (Lập)'),
    action,
    module,
    details,
    ip_address: '113.161.78.45',
    timestamp: new Date().toISOString(),
  }
  const updated = [newLog, ...current].slice(0, 200)
  saveStoredLogs(updated)

  // Asynchronously send to Supabase logs API
  try {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {})
  } catch {
    // ignore
  }
}

export function clearStoredLogs() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(SAMPLE_LOGS))
  } catch (e) {
    console.error('Error clearing stored logs', e)
  }
}

export function resetAllToDefaultSamples() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(SAMPLE_CUSTOMERS))
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(SAMPLE_ORDERS))
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(SAMPLE_LOGS))
  } catch (e) {
    console.error('Error resetting all to default samples', e)
  }
}

export interface CloudBackup {
  id: string
  backup_name: string
  version: string
  created_by: string
  creator_name: string
  customers_count: number
  orders_count: number
  posts_count: number
  categories_count: number
  logs_count: number
  file_size_bytes?: number
  notes?: string
  payload?: any
  created_at: string
}

export const SAMPLE_CLOUD_BACKUPS: CloudBackup[] = []

const LOCAL_STORAGE_KEY_CLOUD_BACKUPS = 'c247_cloud_backups_v4'

export function getStoredCloudBackups(): CloudBackup[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CLOUD_BACKUPS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Error loading stored cloud backups', e)
  }
  return []
}

export function saveStoredCloudBackups(backups: CloudBackup[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CLOUD_BACKUPS, JSON.stringify(backups))
  } catch (e) {
    console.error('Error saving stored cloud backups', e)
  }
}



