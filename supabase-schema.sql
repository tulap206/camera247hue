-- ============================================================
-- Camera 247 Huế - Supabase Database Schema
-- Run this in Supabase SQL Editor to set up your database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'building',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Khách sạn', 'khach-san', 'Hệ thống camera và an ninh cho khách sạn, resort', 'hotel'),
  ('Quán Cà Phê', 'quan-ca-phe', 'Lắp đặt camera cho quán cà phê, nhà hàng', 'coffee'),
  ('Nhà dân', 'nha-dan', 'Camera an ninh cho nhà ở dân cư', 'home'),
  ('Đường phố', 'duong-pho', 'Hệ thống camera giám sát đường phố, khu đô thị', 'map-pin'),
  ('Doanh nghiệp', 'doanh-nghiep', 'Giải pháp an ninh toàn diện cho doanh nghiệp', 'briefcase'),
  ('Trường học', 'truong-hoc', 'Camera an ninh và quản lý ra vào trường học', 'graduation-cap')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt VARCHAR(500),
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  location VARCHAR(255),
  client_name VARCHAR(255),
  completed_at DATE,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CONTACT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  message TEXT NOT NULL,
  service VARCHAR(100),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run this to create public storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts-images', 'posts-images', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can read published posts and categories
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read published posts" ON posts FOR SELECT USING (published = true);

-- Anyone can submit contact form
CREATE POLICY "Anyone can insert contact" ON contact_messages FOR INSERT WITH CHECK (true);

-- Service role can do everything (used for admin API routes)
CREATE POLICY "Service role all categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all posts" ON posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all contacts" ON contact_messages FOR ALL USING (auth.role() = 'service_role');

-- Storage policy
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'posts-images');
CREATE POLICY "Service role upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts-images');
CREATE POLICY "Service role delete images" ON storage.objects FOR DELETE USING (bucket_id = 'posts-images');
