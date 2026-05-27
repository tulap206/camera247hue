'use client'

import { useEffect, useRef } from 'react'
import { Camera, Wifi, Lock, Bell, Monitor, Cpu } from 'lucide-react'

const services = [
  {
    icon: Camera,
    title: 'Camera An Ninh',
    description: 'Thi công hệ thống camera giám sát chuyên nghiệp, hình ảnh sắc nét HD/4K, các thương hiệu hàng đầu: Hikvision, Dahua, Panasonic.',
    features: ['Camera IP & Analog', 'Độ phân giải 2MP-8MP', 'Hồng ngoại ban đêm', 'Xem từ xa qua app'],
    color: '#F5C518',
    tag: 'Phổ biến nhất'
  },
  {
    icon: Lock,
    title: 'Khóa Cửa Thông Minh',
    description: 'Lắp đặt khóa thông minh mở bằng vân tay, thẻ từ, mật mã, điện thoại. Kết nối wifi điều khiển từ xa.',
    features: ['Mở vân tay/thẻ/mật mã', 'Điều khiển từ xa', 'Nhật ký ra vào', 'Báo động đột nhập'],
    color: '#E8A500',
    tag: null
  },
  {
    icon: Wifi,
    title: 'Hệ Thống Mạng',
    description: 'Thiết kế thi công mạng chuyên dụng cho cafe, khách sạn, văn phòng. Tốc độ cao, ổn định với lượng truy cập lớn.',
    features: ['Wifi phủ sóng toàn khu', 'Switch/Router chuyên dụng', 'VLAN quản lý', 'Cabling chuẩn Cat6/6A'],
    color: '#D4920F',
    tag: null
  },
  {
    icon: Bell,
    title: 'Báo Trộm & Định Vị',
    description: 'Hệ thống báo động đột nhập, cảm biến chuyển động, hàng rào điện tử. Thiết bị định vị xe máy, ô tô.',
    features: ['Cảm biến chuyển động', 'Báo động qua điện thoại', 'Định vị GPS xe', 'Hàng rào điện tử'],
    color: '#C07D00',
    tag: null
  },
  {
    icon: Monitor,
    title: 'Máy Chấm Công',
    description: 'Thi công máy chấm công vân tay, thẻ từ. Cổng từ an ninh cho shop, siêu thị chống trộm hàng hóa.',
    features: ['Chấm công vân tay/thẻ', 'Phần mềm quản lý', 'Cổng từ siêu thị', 'Báo cáo tự động'],
    color: '#AA6800',
    tag: null
  },
  {
    icon: Cpu,
    title: 'Máy Tính & Thiết Bị',
    description: 'Cung cấp, sửa chữa máy tính, máy in, thiết bị tin học. Dịch vụ tận nơi nhanh chóng, chuyên nghiệp.',
    features: ['Sửa laptop/PC', 'Bơm mực máy in', 'Linh kiện mạng', 'Bảo trì định kỳ'],
    color: '#8A5200',
    tag: null
  },
]

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.service-card')
            cards.forEach((card, i) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1'
                ;(card as HTMLElement).style.transform = 'translateY(0)'
              }, i * 100)
            })
          }
        })
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="dich-vu" className="py-20 bg-[#0D0D0D] relative overflow-hidden" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-[#F5C518] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[#F5C518] text-sm font-medium mb-4 tracking-widest uppercase">
            <span className="w-8 h-px bg-[#F5C518]" />
            Dịch Vụ Của Chúng Tôi
            <span className="w-8 h-px bg-[#F5C518]" />
          </div>
          <h2 style={{ fontFamily: 'Oswald, sans-serif' }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            GIẢI PHÁP AN NINH
            <span className="text-[#F5C518]"> TOÀN DIỆN</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Cung cấp đầy đủ các giải pháp công nghệ an ninh từ lắp đặt, 
            thi công đến bảo trì — một địa chỉ cho mọi nhu cầu an ninh của bạn.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="service-card group relative bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 hover:border-[#F5C518]/40 transition-all duration-300 cursor-pointer overflow-hidden"
              style={{
                opacity: 0,
                transform: 'translateY(30px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = `0 20px 40px rgba(245,197,24,0.1), 0 0 0 1px rgba(245,197,24,0.2)`
                el.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = 'none'
                el.style.transform = 'translateY(0)'
              }}
            >
              {/* Tag */}
              {service.tag && (
                <div className="absolute top-4 right-4 bg-[#F5C518] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {service.tag}
                </div>
              )}

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#F5C518]/10 flex items-center justify-center mb-4 group-hover:bg-[#F5C518]/20 transition-colors">
                <service.icon className="w-6 h-6 text-[#F5C518]" />
              </div>

              {/* Content */}
              <h3 style={{ fontFamily: 'Oswald, sans-serif' }}
                className="text-xl font-bold text-white mb-2 group-hover:text-[#F5C518] transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F5C518] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#lien-he"
            className="inline-flex items-center gap-2 bg-[#F5C518] text-black px-8 py-3.5 rounded-full font-bold hover:bg-yellow-400 transition-all hover:scale-105">
            Nhận Tư Vấn Miễn Phí
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
