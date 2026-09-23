import Link from 'next/link'
import { Shield, Phone, MapPin, Facebook, Clock } from 'lucide-react'

const services = [
  'Camera an ninh AI',
  'Khóa cửa thông minh',
  'Hệ thống mạng & Wifi',
  'Báo trộm & Định vị',
  'Máy chấm công FaceID',
  'Thiết bị văn phòng',
]

const links = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Dịch vụ', href: '/#dich-vu' },
  { label: 'Quy trình thi công', href: '/#quy-trinh' },
  { label: 'Công trình', href: '/cong-trinh' },
  { label: 'Đăng nhập', href: '/login' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="container-page pt-12 sm:pt-16 pb-[5.5rem] sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
          
          {/* Cột 1: Thông tin pháp nhân & Trụ sở (5 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo/logo-diamond.png"
                alt="Camera 247 Huế"
                className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
              />
              <div>
                <div className="font-heading font-extrabold text-brand-yellow text-base sm:text-lg leading-tight">
                  Camera 247 Huế
                </div>
                <div className="text-white/60 text-xs">Giải pháp công nghệ an ninh</div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-white/85 font-semibold">
                Công ty TNHH Công nghệ An ninh Camera247 Huế
              </p>
              <p className="text-white/55 font-mono">
                Mã số thuế: 3301677400
              </p>
            </div>

            <p className="text-white/60 text-xs leading-relaxed max-w-sm">
              Đơn vị phân phối và thi công camera quan sát, khóa cửa vân tay và hạ tầng mạng chuyên nghiệp tại TP. Huế.
            </p>

            <div className="pt-1">
              <a
                href="https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-xs text-white/70 hover:text-brand-yellow transition-colors"
              >
                <MapPin className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                <span>40 Tùng Thiện Vương, Phường Vỹ Dạ, TP. Huế</span>
              </a>
            </div>
          </div>

          {/* Cột 2: Dịch vụ (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-sm mb-4 text-white">Dịch vụ thi công</h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s}>
                  <a href="/#dich-vu" className="text-white/60 hover:text-brand-yellow transition-colors text-xs sm:text-sm">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Liên kết nhanh (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-sm mb-4 text-white">Liên kết</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-brand-yellow transition-colors text-xs sm:text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Kênh liên hệ trực tuyến (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-heading font-bold text-sm text-white">Kênh kết nối</h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-white/70">
              <a href="tel:0796785151" className="flex items-center gap-2.5 hover:text-brand-yellow transition-colors">
                <Phone className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>0796 785 151 (Tước - Kỹ thuật)</span>
              </a>
              <a href="tel:0967611112" className="flex items-center gap-2.5 hover:text-brand-yellow transition-colors">
                <Phone className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>0967 611 112 (Lập - Hỗ trợ)</span>
              </a>
              <a
                href="https://facebook.com/Camera247Hue"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-brand-yellow transition-colors"
              >
                <Facebook className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>Facebook: Camera247Hue</span>
              </a>
              <div className="flex items-center gap-2.5 text-white/50 text-xs pt-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>7:30 – 18:00 (Thứ 2 – Chủ Nhật)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Camera 247 Huế. Bản quyền đã được bảo lưu.</p>
          <p>Thiết kế bởi Phan Lê Tự Lập</p>
        </div>
      </div>
    </footer>
  )
}
