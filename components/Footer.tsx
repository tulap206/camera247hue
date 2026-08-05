import Link from 'next/link'
import { Shield, Phone, MapPin, Facebook } from 'lucide-react'

const services = [
  'Camera An Ninh',
  'Khóa Cửa Thông Minh',
  'Hệ Thống Mạng',
  'Báo Trộm & Định Vị',
  'Máy Chấm Công',
  'Máy Tính & Thiết Bị',
]

const categories = [
  { name: 'Khách Sạn', slug: 'khach-san' },
  { name: 'Quán Cà Phê', slug: 'quan-ca-phe' },
  { name: 'Nhà Dân', slug: 'nha-dan' },
  { name: 'Đường Phố', slug: 'duong-pho' },
  { name: 'Doanh Nghiệp', slug: 'doanh-nghiep' },
  { name: 'Trường Học', slug: 'truong-hoc' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] relative">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Brand Col (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex w-9 h-9 items-center justify-center rounded-xl bg-[#F5C518]">
                <Shield className="w-5 h-5 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-heading text-lg font-black tracking-wider text-white">CAMERA 247 HUẾ</p>
                <p className="text-[10px] tracking-widest uppercase font-bold text-zinc-500">Huế Security Solutions</p>
              </div>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm font-medium">
              Công ty TNHH Giải Pháp Công Nghệ An Ninh Camera 247 Huế — Đơn vị thi công lắp đặt chuyên nghiệp 
              hệ thống camera giám sát, khóa cửa thông minh và hạ tầng mạng tại tỉnh Thừa Thiên Huế.
            </p>
            <div className="space-y-2 text-xs text-zinc-500 font-medium">
              <a
                href="tel:0967611112"
                className="flex items-center gap-2.5 transition-colors hover:text-[#F5C518]"
              >
                <Phone className="w-4 h-4 shrink-0 text-[#F5C518]" strokeWidth={1.5} /> 
                <span>0967 611 112</span>
              </a>
              <a
                href="https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 transition-colors hover:text-[#F5C518]"
              >
                <MapPin className="w-4 h-4 shrink-0 text-[#F5C518]" strokeWidth={1.5} />
                <span>40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế</span>
              </a>
              <a
                href="https://facebook.com/Camera247Hue"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors hover:text-[#F5C518]"
              >
                <Facebook className="w-4 h-4 text-[#F5C518]" strokeWidth={1.5} /> 
                <span>facebook.com/Camera247Hue</span>
              </a>
            </div>
          </div>

          {/* Dịch vụ (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading text-xs font-black tracking-widest text-white uppercase">Dịch vụ</h4>
            <ul className="space-y-2.5 text-xs text-zinc-500 font-medium">
              {services.map((s) => (
                <li key={s}>
                  <a href="#dich-vu" className="hover:text-[#F5C518] transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Công trình (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading text-xs font-black tracking-widest text-white uppercase">Công trình</h4>
            <ul className="space-y-2.5 text-xs text-zinc-500 font-medium">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/cong-trinh?category=${c.slug}`} className="hover:text-[#F5C518] transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên kết (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-heading text-xs font-black tracking-widest text-white uppercase">Liên kết</h4>
            <ul className="space-y-2.5 text-xs text-zinc-500 font-medium">
              {[
                { label: 'Trang chủ', href: '/' },
                { label: 'Dịch vụ', href: '/#dich-vu' },
                { label: 'Công trình', href: '/cong-trinh' },
                { label: 'Liên hệ', href: '/#lien-he' },
                { label: 'Đăng nhập Admin', href: '/admin' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#F5C518] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
          <p>© {new Date().getFullYear()} CAMERA 247 HUẾ. BẢO LƯU MỌI QUYỀN.</p>
          <p>
            Mã nguồn bảo mật bởi{' '}
            <a href="tel:0967611112" className="text-[#F5C518] hover:underline">
              Phan Lê Tự Lập
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
