# Camera 247 Huế - Website

Landing page chuyên nghiệp cho Công ty TNHH Giải Pháp Công Nghệ An Ninh Camera 247 Huế.

**Stack:** Next.js 14 + TypeScript + Tailwind CSS + Supabase + Vercel

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI

### Bước 1: Tạo Supabase Project

1. Vào [supabase.com](https://supabase.com) → **New Project**
2. Đặt tên: `camera247hue`
3. Chọn vùng: Southeast Asia (Singapore)
4. Sau khi tạo xong, vào **SQL Editor** và chạy toàn bộ nội dung file `supabase-schema.sql`
5. Lấy credentials từ **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Bước 2: Push lên GitHub

```bash
# Tạo repo mới trên GitHub, sau đó:
git init
git add .
git commit -m "Initial commit - Camera 247 Huế website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/camera247hue.git
git push -u origin main
```

### Bước 3: Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New → Project**
2. Import repo GitHub vừa tạo
3. Thêm **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
ADMIN_SECRET = (đặt mật khẩu mạnh của bạn)
```

4. Click **Deploy** → Done! 🎉

### Bước 4: Cài đặt Domain

Trong Vercel → Project Settings → Domains → Thêm `camera247hue.com`

---

## 📁 CẤU TRÚC DỰ ÁN

```
camera247hue/
├── app/
│   ├── page.tsx              # Trang chủ
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx         # 404 page
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── cong-trinh/
│   │   ├── page.tsx          # Danh sách công trình
│   │   └── [slug]/
│   │       └── page.tsx      # Chi tiết công trình
│   └── api/
│       ├── auth/route.ts     # Auth API
│       └── posts/route.ts    # Posts CRUD API
├── components/
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── ServicesSection.tsx
│   ├── WhyUsSection.tsx
│   ├── StatsSection.tsx
│   ├── ProjectsPreview.tsx
│   ├── ProjectsList.tsx
│   ├── ContactSection.tsx
│   ├── Footer.tsx
│   └── FloatingContact.tsx   # Nút liên hệ nổi
├── lib/
│   └── supabase.ts           # Supabase client & types
├── styles/
│   └── globals.css
├── supabase-schema.sql       # Database schema
└── .env.local.example        # Mẫu biến môi trường
```

---

## 🔑 ĐĂNG NHẬP ADMIN

URL: `https://camera247hue.com/admin`

Mật khẩu: Giá trị bạn đặt cho `ADMIN_SECRET` trong Vercel

### Chức năng Admin:
- ✅ Xem thống kê (tổng bài, đã đăng, liên hệ, chưa đọc)
- ✅ Tạo/sửa/xóa bài viết công trình
- ✅ Ẩn/hiện bài viết
- ✅ Đánh dấu nổi bật (hiển thị trang chủ)
- ✅ Xem và xử lý yêu cầu liên hệ từ khách hàng

---

## 📸 QUẢN LÝ ẢNH

Tải ảnh lên **Supabase Storage** bucket `posts-images`:
1. Vào Supabase → Storage → posts-images
2. Upload ảnh
3. Copy URL ảnh → Dán vào form bài viết (trường "Ảnh Bìa")

---

## 🎨 TÙNG CHỈNH

- **Logo/Tên công ty**: Sửa trong `components/Navbar.tsx` và `components/Footer.tsx`
- **Số điện thoại**: Tìm kiếm toàn bộ `0967611112` và thay thế
- **Địa chỉ**: Tìm `Tùng Thiện Vương` và thay thế
- **Màu sắc**: Sửa `--brand-yellow: #F5C518` trong `styles/globals.css`
- **Facebook**: Tìm `Camera247Hue` và thay bằng page của bạn

---

## 📞 HỖ TRỢ

Camera 247 Huế - 0967 611 112
