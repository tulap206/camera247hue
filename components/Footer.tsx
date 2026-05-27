import Link from 'next/link'
import { Shield, Phone, MapPin, Facebook, Mail, ChevronRight } from 'lucide-react'

const services = [
  'Camera An Ninh', 'Khóa Cửa Thông Minh', 'Hệ Thống Mạng',
  'Báo Trộm & Định Vị', 'Máy Chấm Công', 'Máy Tính & Thiết Bị',
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
    <footer className="bg-[#0A0A0A] border-t border-gray-900 relative">
      <div className="hazard-stripe h-1 opacity-60" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F5C518] rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="font-bold text-[#F5C518] text-lg leading-tight"
                  style={{ fontFamily: 'Oswald, sans-serif' }}>CAMERA 247 HUẾ</div>
                <div className="text-gray-500 text-xs">Giải Pháp Công Nghệ An Ninh</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Công ty TNHH Giải Pháp Công Nghệ An Ninh Camera 247 Huế — 
              đơn vị hàng đầu về lắp đặt camera và hệ thống an ninh tại Tp. Huế.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <a href="tel:0967611112" className="flex items-center gap-2 hover:text-[#F5C518] transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" /> 0967 611 112
              </a>
              <a href="https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế" target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-[#F5C518] transition-colors">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế</span>
              </a>
              <a href="https://facebook.com/Camera247Hue" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#F5C518] transition-colors">
                <Facebook className="w-4 h-4" /> Camera247Hue
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider"
              style={{ fontFamily: 'Oswald, sans-serif' }}>Dịch Vụ</h4>
            <ul className="space-y-2">
              {services.map(s => (
                <li key={s}>
                  <a href="#dich-vu"
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#F5C518] transition-colors text-sm">
                    <ChevronRight className="w-3 h-3" /> {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider"
              style={{ fontFamily: 'Oswald, sans-serif' }}>Công Trình</h4>
            <ul className="space-y-2">
              {categories.map(c => (
                <li key={c.slug}>
                  <Link href={`/cong-trinh?category=${c.slug}`}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#F5C518] transition-colors text-sm">
                    <ChevronRight className="w-3 h-3" /> {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider"
              style={{ fontFamily: 'Oswald, sans-serif' }}>Liên Kết</h4>
            <ul className="space-y-2">
              {[
                { label: 'Trang Chủ', href: '/' },
                { label: 'Dịch Vụ', href: '/#dich-vu' },
                { label: 'Công Trình', href: '/cong-trinh' },
                { label: 'Liên Hệ', href: '/#lien-he' },
                { label: 'Đăng Nhập Admin', href: '/admin' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#F5C518] transition-colors text-sm">
                    <ChevronRight className="w-3 h-3" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              <a href="https://facebook.com/Camera247Hue" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-[#1E1E1E] rounded-lg flex items-center justify-center border border-gray-800 hover:border-[#F5C518]/50 hover:bg-[#F5C518]/10 transition-all">
                <Facebook className="w-4 h-4 text-gray-400 hover:text-[#F5C518]" />
              </a>
              <a href="tel:0967611112"
                className="w-9 h-9 bg-[#1E1E1E] rounded-lg flex items-center justify-center border border-gray-800 hover:border-[#F5C518]/50 hover:bg-[#F5C518]/10 transition-all">
                <Phone className="w-4 h-4 text-gray-400 hover:text-[#F5C518]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Camera 247 Huế. Bảo lưu mọi quyền.</p>
          <p>Thiết kế bởi Phan Lê Tự Lập - Camera 247 Huế | <a href="tel:0967611112" className="text-[#F5C518] hover:underline">0967 611 112</a></p>
        </div>
      </div>
    </footer>
  )
}
