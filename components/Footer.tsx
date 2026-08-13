import Link from 'next/link'
import { Shield, Phone, MapPin, Facebook } from 'lucide-react'

const services = [
  'Camera an ninh',
  'Khóa cửa thông minh',
  'Hệ thống mạng',
  'Báo trộm và định vị',
  'Máy chấm công',
  'Máy tính và thiết bị',
]

const links = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Dịch vụ', href: '/#dich-vu' },
  { label: 'Công trình', href: '/cong-trinh' },
  { label: 'Liên hệ', href: '/#lien-he' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="container-page pt-12 sm:pt-16 pb-[5.5rem] sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-navy" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-brand-yellow text-lg leading-tight">
                  Camera 247 Huế
                </div>
                <div className="text-white/50 text-xs">Giải pháp công nghệ an ninh</div>
              </div>
            </div>
            <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-xs">
              Đơn vị thi công camera an ninh, khóa thông minh và hệ thống mạng tại Tp. Huế.
            </p>
            <div className="space-y-2.5 text-sm text-white/55">
              <a href="tel:0967611112" className="flex items-center gap-2 hover:text-brand-yellow transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                0967 611 112
              </a>
              <a
                href="https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-brand-yellow transition-colors"
              >
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế</span>
              </a>
              <a
                href="https://facebook.com/Camera247Hue"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-brand-yellow transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Camera247Hue
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm mb-4">Dịch vụ</h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s}>
                  <a href="/#dich-vu" className="text-white/55 hover:text-brand-yellow transition-colors text-sm">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm mb-4">Liên kết</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/55 hover:text-brand-yellow transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm mb-4">Hotline</h4>
            <p className="text-white/55 text-sm mb-4 leading-relaxed">
              Gọi ngay để được khảo sát và tư vấn miễn phí trong ngày.
            </p>
            <a href="tel:0967611112" className="btn-accent !text-sm inline-flex">
              0967 611 112
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-sm text-white/40">
          <p>© {new Date().getFullYear()} Camera 247 Huế. Bảo lưu mọi quyền.</p>
          <p>
            Thiết kế bởi Phan Lê Tự Lập
          </p>
        </div>
      </div>
    </footer>
  )
}
