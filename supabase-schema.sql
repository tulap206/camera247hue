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
-- SEED DANH MỤC DỊCH VỤ CƠ BẢN (CATEGORIES)
-- ============================================================
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
