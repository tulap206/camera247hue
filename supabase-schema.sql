-- ============================================================
-- Camera 247 Huế - Supabase Database Full Schema & Real Data Seed
-- Chạy toàn bộ mã SQL này trong Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ============================================================

-- Bật Extension UUID nếu chưa có
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. DANH MỤC DỊCH VỤ & CÔNG TRÌNH (CATEGORIES)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Camera',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. BÀI VIẾT CÔNG TRÌNH & DỰ ÁN THỰC TẾ (POSTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  location VARCHAR(255),
  client_name VARCHAR(255),
  completed_at DATE,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. DANH BẠ KHÁCH HÀNG THỰC TẾ (CUSTOMERS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  phone_secondary VARCHAR(100),
  zalo VARCHAR(50),
  email VARCHAR(255),
  address TEXT NOT NULL,
  district VARCHAR(100),
  type VARCHAR(50) DEFAULT 'individual',
  tier VARCHAR(50) DEFAULT 'standard',
  tax_code VARCHAR(50),
  idcard VARCHAR(50),
  notes TEXT,
  total_orders INT DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. ĐƠN THI CÔNG & THEO DÕI BẢO HÀNH (INSTALLATION_ORDERS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.installation_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  services TEXT[] DEFAULT '{}',
  equipment_list TEXT NOT NULL,
  installation_date VARCHAR(50),
  completion_date VARCHAR(50),
  warranty_months INT DEFAULT 24,
  warranty_until VARCHAR(50),
  total_amount NUMERIC DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'warranty',
  technician VARCHAR(100) DEFAULT 'Phạm Bá Tước & Phan Lê Tự Lập',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (ACCESS_LOGS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  display_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. SAO LƯU ĐÁM MÂY (CLOUD_BACKUPS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cloud_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) DEFAULT '2.5',
  created_by VARCHAR(100) DEFAULT 'admin',
  creator_name VARCHAR(255) DEFAULT 'Quản trị viên (Lập)',
  customers_count INT DEFAULT 0,
  orders_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  categories_count INT DEFAULT 0,
  logs_count INT DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  notes TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. TIN NHẮN LIÊN HỆ TỪ KHÁCH HÀNG (CONTACT_MESSAGES)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  message TEXT NOT NULL,
  service VARCHAR(100),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STORAGE BUCKET CHO ẢNH BÀI VIẾT
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts-images', 'posts-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed to avoid conflicts
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Public read published posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can insert contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Service role all categories" ON public.categories;
DROP POLICY IF EXISTS "Service role all posts" ON public.posts;
DROP POLICY IF EXISTS "Service role all customers" ON public.customers;
DROP POLICY IF EXISTS "Service role all orders" ON public.installation_orders;
DROP POLICY IF EXISTS "Service role all logs" ON public.access_logs;
DROP POLICY IF EXISTS "Service role all backups" ON public.cloud_backups;
DROP POLICY IF EXISTS "Service role all contacts" ON public.contact_messages;

-- Create Policies
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT USING (published = true);
CREATE POLICY "Anyone can insert contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role all categories" ON public.categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all posts" ON public.posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all customers" ON public.customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all orders" ON public.installation_orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all logs" ON public.access_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all backups" ON public.cloud_backups FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all contacts" ON public.contact_messages FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DỮ LIỆU CHUẨN THỰC TẾ CHO CAMERA 247 HUẾ (VỚI UUID CHUẨN)
-- ============================================================

-- 1. Categories
INSERT INTO public.categories (id, name, slug, description, icon) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Camera Quan Sát & AI', 'camera-quan-sat', 'Hệ thống camera giám sát an ninh độ nét cao, camera AI nhận diện khuôn mặt, biển số và cảnh báo chủ động', 'Camera'),
  ('c0000000-0000-0000-0000-000000000002', 'Khóa Cửa Thông Minh & Vân Tay', 'khoa-cua-thong-minh', 'Khóa vân tay, thẻ từ, mã số, nhận diện gương mặt FaceID cao cấp cho biệt thự, căn hộ và văn phòng', 'Lock'),
  ('c0000000-0000-0000-0000-000000000003', 'Hạ Tầng Mạng & Wifi Chuyên Dụng', 'mang-wifi-chuyen-dung', 'Hệ thống mạng LAN, Wifi Mesh chịu tải cao cho nhà hàng, khách sạn, quán cafe, văn phòng tại Huế', 'Wifi'),
  ('c0000000-0000-0000-0000-000000000004', 'Báo Động & Nhà Thông Minh', 'bao-dong-thong-minh', 'Hệ thống chống trộm, cảm biến hồng ngoại, chuông cửa có hình và tự động hóa nhà thông minh', 'Bell'),
  ('c0000000-0000-0000-0000-000000000005', 'Máy Chấm Công & Kiểm Soát Ra Vào', 'may-cham-cong', 'Thiết bị chấm công vân tay, khuôn mặt AI, phần mềm quản lý chấm công và kiểm soát phân quyền', 'Clock')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- 2. Khách hàng thực tế (Customers)
INSERT INTO public.customers (id, name, phone, phone_secondary, zalo, email, address, district, type, tier, tax_code, notes, total_orders, total_spent) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Khách sạn Hương Giang Resort & Spa',
    '0234 382 1222',
    '0913 421 888 (Quản lý vận hành)',
    '0913421888',
    'contact@huonggianghotel.com.vn',
    '51 Lê Lợi, P. Phú Hội, TP. Huế',
    'TP. Huế (Trung tâm)',
    'business',
    'vip',
    '3300101890',
    'Dự án trọn gói 32 Camera IP Hikvision 4MP ColorVu có màu 24/24 + Đầu ghi NVR 32 kênh 4K + Tủ Rack trung tâm 10U. Cần bảo dưỡng định kỳ 6 tháng/lần.',
    1,
    0
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Anh Hoàng Đăng Khoa (Biệt thự An Cựu City)',
    '0914 552 889',
    NULL,
    '0914552889',
    NULL,
    'Khu Đô Thị An Cựu City, P. An Đông, TP. Huế',
    'TP. Huế (Trung tâm)',
    'individual',
    'vip',
    NULL,
    'Lắp khóa thông minh Kaadas K20 Pro Max 3D FaceID cho cửa chính đại sảnh gỗ lim + Khóa vân tay phòng ngủ Philips DDL603E.',
    1,
    0
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'The Time Coffee Lounge (18 Hùng Vương)',
    '0905 889 124',
    NULL,
    '0905889124',
    NULL,
    '18 Hùng Vương, P. Phú Nhuận, TP. Huế',
    'TP. Huế (Trung tâm)',
    'business',
    'standard',
    NULL,
    'Hạ tầng Router cân bằng tải DrayTek Vigor2927 + 4 Bộ phát Ruijie Wifi 6 chịu tải 200+ khách, phân tách VLAN quản lý & POS bán hàng.',
    1,
    0
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Công ty May Xuất Khẩu Phú Bài',
    '0234 386 1999',
    '0905 321 654 (P. Hành chính Nhân sự)',
    '0905321654',
    'hr@mayphubai.vn',
    'Đường số 3, KCN Phú Bài, TX. Hương Thủy, TT. Huế',
    'KCN Phú Bài - Hương Thủy',
    'business',
    'vip',
    '3301229871',
    'Quy mô nhà xưởng 3.500m2: 16 Camera Dahua IP67 công nghiệp + 2 máy FaceID Hikvision + 300m cáp quang chuyên dụng kết nối xưởng 2.',
    1,
    0
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Gia đình Chú Trần Hữu Nghĩa (Nhà phố Chi Lăng)',
    '0935 882 119',
    NULL,
    '0935882119',
    NULL,
    '142 Chi Lăng, P. Phú Cát, TP. Huế',
    'TP. Huế (Trung tâm)',
    'individual',
    'standard',
    NULL,
    'Bộ 4 mắt camera Dahua Full Color xem đêm có màu 24/24 + Đầu ghi 4 kênh + Ổ cứng WD Purple 1TB. Nẹp gen vuông chống nước thẩm mỹ.',
    1,
    0
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  phone_secondary = EXCLUDED.phone_secondary,
  zalo = EXCLUDED.zalo,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  district = EXCLUDED.district,
  type = EXCLUDED.type,
  tier = EXCLUDED.tier,
  tax_code = EXCLUDED.tax_code,
  notes = EXCLUDED.notes;

-- 3. Bài viết công trình thực tế (Posts)
INSERT INTO public.posts (id, title, slug, content, excerpt, cover_image, images, category_id, location, client_name, completed_at, featured, published) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Lắp Đặt Hệ Thống 32 Camera Giám Sát Khách Sạn Hương Giang Huế',
    'lap-dat-32-camera-khach-san-huong-giang-hue',
    '# Giới Thiệu Dự Án
Khách sạn Hương Giang Resort & Spa (51 Lê Lợi, TP. Huế) là một trong những khu nghỉ dưỡng danh tiếng bên bờ sông Hương. Nhằm nâng cấp tiêu chuẩn an ninh 5 sao và quản lý toàn diện khu vực sảnh, hành lang, bãi xe và khuôn viên bờ sông, ban quản lý đã tin tưởng lựa chọn **Camera 247 Huế** làm đơn vị tổng thầu thi công trọn gói.

# Giải Pháp Kỹ Thuật Đã Triển Khai
- Trang bị **32 Camera IP Hikvision 4.0MP ColorVu** có màu 24/24 ban đêm, tích hợp mic thu âm đa hướng.
- Đầu ghi hình NVR 32 kênh 4K chuẩn nén H.265+ kèm ổ cứng chuyên dụng lưu trữ 30 ngày liên tục.
- Hệ thống tủ rack trung tâm, switch PoE chuyên dụng và đường dây cáp mạng Cat6 chống nhiễu đạt chuẩn công nghiệp.
- Cài đặt hệ thống phân quyền giám sát tập trung tại phòng an ninh và truyền dữ liệu qua điện thoại cho ban giám đốc.

# Kết Quả Nghiệm Thu & Đánh Giá
Toàn bộ hệ thống được bàn giao đúng tiến độ 3 ngày, hình ảnh cực kỳ sắc nét cả ngày lẫn đêm, đường dây được luồn ống gen thẩm mỹ, đảm bảo tuyệt đối vẻ đẹp kiến trúc sang trọng của khách sạn.',
    'Triển khai trọn gói 32 camera IP ColorVu có màu ban đêm, đầu ghi 32 kênh 4K và tủ mạng trung tâm cho Hương Giang Resort & Spa bên bờ sông Hương.',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
    ],
    'c0000000-0000-0000-0000-000000000001',
    '51 Lê Lợi, P. Phú Hội, TP. Huế',
    'Khách sạn Hương Giang Resort & Spa',
    '2026-01-15',
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Triển Khai Khóa Cửa Vân Tay Nhận Diện FaceID Cho Biệt Thự An Cựu City',
    'lap-dat-khoa-van-tay-faceid-biet-thu-an-cuu-city-hue',
    '# Nhu Cầu Của Gia Chủ
Gia đình anh Hoàng Đăng Khoa tại KĐT An Cựu City mong muốn sở hữu một hệ thống khóa cửa thông minh cao cấp nhất hiện nay cho cửa chính gỗ lim và hệ thống khóa thẻ từ cho các phòng ngủ, đảm bảo an toàn vượt trội, mở khóa nhanh không cần chìa khóa cơ truyền thống và quản lý từ xa qua smartphone.

# Giải Pháp Khóa Thông Minh Được Lựa Chọn
- Cửa chính: Lắp đặt khóa thông minh **Kaadas K20 Pro Max 3D FaceID** tích hợp camera quan sát chuông hình góc rộng, mở bằng khuôn mặt 3D, vân tay bán dẫn FPC Thụy Điển, mã số ảo và app điện thoại WiFi.
- Các phòng ngủ & ban công: Khóa tay gạt vân tay thông minh Philips DDL603E chống cạy phá.
- Tích hợp cảnh báo đột nhập tức thời và thông báo trạng thái đóng/mở cửa trực tiếp về điện thoại gia chủ.

# Bàn Giao & Hướng Dẫn Sử Dụng
Kỹ thuật viên Camera 247 Huế đã hoàn tất lắp đặt tỉ mỉ, đục khoét chuẩn xác trên nền gỗ lim, cài đặt vân tay/khuôn mặt cho tất cả thành viên trong gia đình và kích hoạt gói bảo hành tận nơi 24 tháng.',
    'Lắp đặt khóa FaceID 3D tích hợp chuông cửa màn hình Kaadas K20 Pro Max cho cửa chính biệt thự gỗ lim tại Khu Đô Thị An Cựu City, TP. Huế.',
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    'c0000000-0000-0000-0000-000000000002',
    'Khu Đô Thị An Cựu City, TP. Huế',
    'Anh Hoàng Đăng Khoa',
    '2026-02-02',
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Thi Công Hệ Thống Mạng Wifi Mesh Chịu Tải Quán Cafe The Time Hùng Vương',
    'thi-cong-wifi-chiu-tai-cafe-the-time-hung-vuong-hue',
    '# Hiện Trạng & Thách Thức
The Time Coffee Lounge tại 18 Hùng Vương là điểm đến quen thuộc của giới trẻ và dân văn phòng tại Huế với lưu lượng khách giờ cao điểm lên tới hơn 150 người truy cập đồng thời. Hệ thống modem nhà mạng cũ thường xuyên bị nghẽn mạng, rớt kết nối và khách phàn nàn về tốc độ wifi.

# Giải Pháp Hạ Tầng Mạng Do Camera 247 Huế Triển Khai
- Lắp đặt **Router Cân Bằng Tải DrayTek Vigor2927** hỗ trợ gộp 2 đường truyền Internet tốc độ cao, phân tải thông minh và bảo mật QoS.
- Phủ sóng toàn bộ 2 tầng và sân vườn bằng **4 Bộ phát Wifi Ruijie Reyee RG-RAP2200(E)** chuẩn Wifi 6, hỗ trợ Roaming liền mạch không gián đoạn kết nối khi di chuyển.
- Phân tách 3 dải mạng độc lập: Mạng Quản lý & Thu ngân POS (ưu tiên băng thông cao nhất), Mạng Nhân viên và Mạng Khách hàng (có trang chào Marketing).

# Đánh Giá Hiệu Năng Sau Nghiệm Thu
Kiểm tra thực tế với hơn 160 thiết bị online cùng lúc cho tốc độ download/upload luôn đạt trên 95Mbps tại mọi góc ngồi, độ trễ ping dưới 5ms, giải quyết dứt điểm tình trạng gián đoạn mạng.',
    'Nâng cấp toàn diện mạng Wifi 6 chịu tải 200+ user với Router DrayTek cân bằng tải và 4 bộ phát Ruijie Mesh cho The Time Coffee Lounge Huế.',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
    ],
    'c0000000-0000-0000-0000-000000000003',
    '18 Hùng Vương, TP. Huế',
    'The Time Coffee Lounge',
    '2026-02-20',
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Hệ Thống Camera An Ninh & Máy Chấm Công Khuôn Mặt AI Nhà Xưởng May Phú Bài',
    'camera-an-ninh-may-cham-cong-khuon-mat-nha-xuong-may-phu-bai',
    '# Quy Mô Dự Án Nhà Xưởng
Công ty May Xuất Khẩu Phú Bài tại Khu Công Nghiệp Phú Bài (Hương Thủy, TT. Huế) có diện tích sản xuất hơn 3.500m2 với hơn 200 công nhân. Yêu cầu đặt ra là giám sát chặt chẽ chuyền may, kho vải, bãi xuất nhập hàng và tự động hóa quy trình chấm công tránh tình trạng gian lận bấm hộ.

# Hạng Mục Kỹ Thuật Đã Hoàn Thành
- **16 Camera Thân Trụ Dahua Full HD 2.0MP** chuẩn chống nước IP67 chuyên dụng cho môi trường công nghiệp nhiều bụi bẩn.
- Cáp mạng quang chuyên dụng kết nối khoảng cách xa hơn 300 mét giữa văn phòng quản lý và xưởng 2.
- **2 Máy Chấm Công Khuôn Mặt AI Hikvision DS-K1T342MFX** nhận diện chỉ trong 0.2 giây, nhận diện chính xác kể cả khi công nhân đeo khẩu trang.
- Cài đặt phần mềm tính công tự động xuất bảng chấm công Excel hàng tháng liên kết trực tiếp phòng nhân sự.

# Bàn Giao & Vận Hành
Hệ thống vận hành mượt mà, giúp ban giám đốc giảm 80% thời gian xử lý dữ liệu chấm công thủ công và nâng cao ý thức làm việc của toàn thể cán bộ công nhân viên.',
    'Triển khai 16 camera an ninh nhà xưởng kết hợp hệ thống 2 máy chấm công nhận diện FaceID AI và phần mềm tính công tự động cho nhà máy may tại KCN Phú Bài.',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
    ],
    'c0000000-0000-0000-0000-000000000005',
    'Đường số 3, KCN Phú Bài, TX. Hương Thủy',
    'Công ty May Xuất Khẩu Phú Bài',
    '2026-03-05',
    false,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'Lắp Đặt Trọn Gói Bộ 4 Camera Dahua Full Color Có Màu Ban Đêm Cho Hộ Gia Đình',
    'lap-dat-4-camera-dahua-full-color-nha-pho-chi-lang-hue',
    '# Yêu Cầu Của Khách Hàng
Gia đình Chú Nghĩa tại đường Chi Lăng (P. Phú Cát, TP. Huế) cần lắp đặt camera để quan sát khu vực cổng trước, sân vườn, phòng khách và ban công tầng 2 để an tâm khi đi làm xa và chăm sóc ông bà lớn tuổi ở nhà.

# Trọn Bộ Thiết Bị Được Lắp Đặt
- **4 Mắt Camera Dahua Full Color 2.0MP** tích hợp đèn LED trợ sáng xem hình ảnh có màu sắc sống động suốt đêm 24/24.
- Đầu ghi hình 4 kênh chuẩn nén hình ảnh siêu tiết kiệm dung lượng, ổ cứng Western Digital Purple 1TB chuyên dụng camera.
- Nguồn cấp điện tử chống sét, jack BNC đồng nguyên chất và hộp kỹ thuật bảo vệ mối nối thẩm mỹ.
- Cài đặt ứng dụng DMSS tiếng Việt trên 4 điện thoại của các thành viên trong gia đình.

# Tiến Độ Hoàn Thành & Bảo Hành
Thi công hoàn tất và bàn giao chỉ trong 4 giờ làm việc. Đường dây được nẹp gen vuông trắng gọn gàng theo mép tường. Cam kết bảo hành chính hãng tận nơi 24 tháng 1 đổi 1.',
    'Giải pháp bảo vệ an ninh trọn gói cho nhà phố: 4 mắt camera Dahua Full Color xem đêm có màu, lưu trữ 15 ngày và xem trực tiếp trên điện thoại mượt mà.',
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    'c0000000-0000-0000-0000-000000000001',
    'Đường Chi Lăng, P. Phú Cát, TP. Huế',
    'Gia đình Chú Trần Hữu Nghĩa',
    '2026-03-18',
    false,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  cover_image = EXCLUDED.cover_image,
  images = EXCLUDED.images,
  category_id = EXCLUDED.category_id,
  location = EXCLUDED.location,
  client_name = EXCLUDED.client_name,
  completed_at = EXCLUDED.completed_at,
  featured = EXCLUDED.featured,
  published = EXCLUDED.published;

-- 4. Đơn hàng thi công & bảo hành (Installation Orders)
INSERT INTO public.installation_orders (id, order_code, customer_id, customer_name, customer_phone, customer_address, services, equipment_list, installation_date, completion_date, warranty_months, warranty_until, total_amount, deposit_amount, status, technician, notes) VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'C247-2026-001',
    'a0000000-0000-0000-0000-000000000001',
    'Khách sạn Hương Giang Resort & Spa',
    '0234 382 1222',
    '51 Lê Lợi, P. Phú Hội, TP. Huế',
    ARRAY['camera', 'it_network'],
    '32 Camera IP Hikvision 4.0MP ColorVu + Đầu ghi NVR 32 kênh 4K chuẩn H.265+ + Ổ cứng WD Purple 8TB + Tủ Rack trung tâm 10U + Switch PoE 24 Port',
    '12/01/2026',
    '15/01/2026',
    24,
    '15/01/2028',
    0,
    0,
    'warranty',
    'Phan Lê Tự Lập & Phạm Bá Tước',
    'Hệ thống thi công trong 3 ngày theo đúng bài viết công trình, đã bàn giao phòng an ninh & app ban giám đốc. Bảo hành 24 tháng đến 15/01/2028.'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'C247-2026-002',
    'a0000000-0000-0000-0000-000000000002',
    'Anh Hoàng Đăng Khoa (Biệt thự An Cựu City)',
    '0914 552 889',
    'Khu Đô Thị An Cựu City, P. An Đông, TP. Huế',
    ARRAY['smart_lock'],
    '01 Khóa Kaadas K20 Pro Max 3D FaceID tích hợp camera chuông hình + 02 Khóa vân tay phòng ngủ Philips DDL603E',
    '01/02/2026',
    '02/02/2026',
    24,
    '02/02/2028',
    0,
    0,
    'warranty',
    'Phan Lê Tự Lập',
    'Đục khoét chuẩn xác trên nền gỗ lim, bàn giao thẻ từ, chìa cơ và thiết lập FaceID toàn bộ gia đình. Bảo hành 24 tháng đến 02/02/2028.'
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'C247-2026-003',
    'a0000000-0000-0000-0000-000000000003',
    'The Time Coffee Lounge (18 Hùng Vương)',
    '0905 889 124',
    '18 Hùng Vương, P. Phú Nhuận, TP. Huế',
    ARRAY['wifi', 'it_network'],
    '01 Router Cân Bằng Tải DrayTek Vigor2927 + 04 Bộ phát Wifi Ruijie Reyee RG-RAP2200(E) Wifi 6 + Switch Gigabit PoE',
    '19/02/2026',
    '20/02/2026',
    24,
    '20/02/2028',
    0,
    0,
    'warranty',
    'Phạm Bá Tước',
    'Gộp 2 đường truyền Internet, cấu hình Roaming không ngắt quãng và trang chào tiếp thị WiFi Marketing. Bảo hành 24 tháng đến 20/02/2028.'
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'C247-2026-004',
    'a0000000-0000-0000-0000-000000000004',
    'Công ty May Xuất Khẩu Phú Bài',
    '0234 386 1999',
    'Đường số 3, KCN Phú Bài, TX. Hương Thủy, TT. Huế',
    ARRAY['camera', 'time_attendance', 'it_network'],
    '16 Camera Thân Dahua Full HD 2.0MP IP67 + 02 Máy Chấm Công FaceID AI Hikvision DS-K1T342MFX + 300m Cáp mạng quang + Module quang + NVR 16 kênh',
    '01/03/2026',
    '05/03/2026',
    24,
    '05/03/2028',
    0,
    0,
    'warranty',
    'Phan Lê Tự Lập & Phạm Bá Tước',
    'Đã bàn giao phần mềm xuất bảng chấm công tự động cho phòng nhân sự. Bảo hành chính hãng 24 tháng đến 05/03/2028.'
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'C247-2026-005',
    'a0000000-0000-0000-0000-000000000005',
    'Gia đình Chú Trần Hữu Nghĩa (Nhà phố Chi Lăng)',
    '0935 882 119',
    '142 Chi Lăng, P. Phú Cát, TP. Huế',
    ARRAY['camera'],
    '04 Mắt Camera Dahua Full Color 2.0MP + 01 Đầu ghi 4 kênh H.265+ + Ổ cứng WD Purple 1TB + Bộ nguồn & Hộp kỹ thuật bảo vệ',
    '18/03/2026',
    '18/03/2026',
    24,
    '18/03/2028',
    0,
    0,
    'warranty',
    'Phan Lê Tự Lập',
    'Thi công trong 4 giờ làm việc. Cài đặt app DMSS xem trực tiếp và xem lại trên 4 điện thoại của gia đình. Bảo hành 24 tháng đến 18/03/2028.'
  )
ON CONFLICT (order_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  customer_phone = EXCLUDED.customer_phone,
  customer_address = EXCLUDED.customer_address,
  services = EXCLUDED.services,
  equipment_list = EXCLUDED.equipment_list,
  installation_date = EXCLUDED.installation_date,
  completion_date = EXCLUDED.completion_date,
  warranty_months = EXCLUDED.warranty_months,
  warranty_until = EXCLUDED.warranty_until,
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  technician = EXCLUDED.technician,
  notes = EXCLUDED.notes;

-- 5. Access Logs
INSERT INTO public.access_logs (id, username, display_name, action, module, details, ip_address, timestamp) VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'admin',
    'Quản trị viên (Lập)',
    'Đăng nhập',
    'Hệ thống & Đăng nhập',
    'Đăng nhập thành công vào bảng điều khiển quản trị [macOS Chrome]',
    '113.161.78.45',
    NOW() - INTERVAL '15 minutes'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'admin',
    'Quản trị viên (Lập)',
    'Cập nhật',
    'Đơn hàng',
    'Kích hoạt hồ sơ bảo hành 24 tháng đơn hàng #C247-2026-005 (Bộ 4 Camera Full Color Chú Trần Hữu Nghĩa - Chi Lăng)',
    '113.161.78.45',
    NOW() - INTERVAL '45 minutes'
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'admin1',
    'Quản trị viên (Tước)',
    'Cập nhật',
    'Khách hàng',
    'Nghiệm thu đồng bộ hồ sơ khách hàng Doanh nghiệp: Công ty May Xuất Khẩu Phú Bài (KCN Phú Bài)',
    '14.238.12.90',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'visitor',
    'Khách xem Web',
    'Xem',
    'Khách xem Web',
    'Khách hàng xem bài viết công trình: Lắp đặt hệ thống 32 Camera an ninh Khách sạn Hương Giang Resort & Spa',
    '42.118.23.104',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'e0000000-0000-0000-0000-000000000005',
    'admin',
    'Quản trị viên (Lập)',
    'Sao lưu',
    'Cài đặt & Sao lưu',
    'Tạo bản sao lưu đám mây (Cloud Snapshot) đồng bộ dữ liệu chuẩn theo 5 bài viết công trình thực tế',
    '113.161.78.45',
    NOW() - INTERVAL '5 hours'
  )
ON CONFLICT (id) DO NOTHING;
