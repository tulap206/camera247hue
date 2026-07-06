'use client'

import { Camera, Wifi, Lock, Bell, Monitor, Cpu } from 'lucide-react'
import Reveal from '@/components/Reveal'

const services = [
  {
    icon: Camera,
    title: 'Camera An Ninh',
    description:
      'Hệ thống giám sát HD/4K từ Hikvision, Dahua, Panasonic. Xem từ xa qua ứng dụng.',
    features: ['Camera IP & Analog', 'Hồng ngoại ban đêm', 'Lưu trữ đám mây/NVR'],
    tag: 'Phổ biến nhất',
    span: 'lg:col-span-7 lg:row-span-2',
    featured: true,
  },
  {
    icon: Lock,
    title: 'Khóa Cửa Thông Minh',
    description: 'Mở vân tay, thẻ, mật mã. Điều khiển từ xa qua điện thoại.',
    features: ['Nhật ký ra vào', 'Báo động đột nhập'],
    span: 'lg:col-span-5',
  },
  {
    icon: Wifi,
    title: 'Hệ Thống Mạng',
    description: 'Wifi phủ sóng toàn khu cho cafe, khách sạn, văn phòng.',
    features: ['Switch/Router chuyên dụng', 'Cabling Cat6/6A'],
    span: 'lg:col-span-4',
  },
  {
    icon: Bell,
    title: 'Báo Trộm & Định Vị',
    description: 'Cảm biến chuyển động, hàng rào điện tử, định vị GPS xe.',
    features: ['Báo động qua điện thoại'],
    span: 'lg:col-span-4',
  },
  {
    icon: Monitor,
    title: 'Máy Chấm Công',
    description: 'Chấm công vân tay, cổng từ an ninh cho siêu thị.',
    features: ['Phần mềm quản lý', 'Báo cáo tự động'],
    span: 'lg:col-span-4',
  },
  {
    icon: Cpu,
    title: 'Máy Tính & Thiết Bị',
    description: 'Sửa chữa, bảo trì máy tính, máy in, thiết bị mạng tận nơi.',
    features: ['Bơm mực máy in', 'Bảo trì định kỳ'],
    span: 'lg:col-span-12',
    wide: true,
  },
]

export default function ServicesSection() {
  return (
    <section id="dich-vu" className="py-20 sm:py-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#F5C518]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-12">
          <h2
            style={{ fontFamily: 'Oswald, sans-serif' }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            GIẢI PHÁP AN NINH
            <span className="text-[#F5C518]"> TOÀN DIỆN</span>
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-[52ch]">
            Lắp đặt, thi công và bảo trì tại một địa chỉ. Từ nhà ở đến khách sạn, quán cafe và doanh nghiệp.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 auto-rows-fr">
          {services.map((service, index) => (
            <Reveal
              key={service.title}
              delay={index * 0.06}
              className={`group surface-card p-6 relative overflow-hidden ${service.span} ${
                service.featured ? 'min-h-[280px]' : ''
              } ${service.wide ? 'lg:flex lg:items-center lg:justify-between lg:gap-8' : ''}`}
            >
              {service.tag && (
                <div className="absolute top-4 right-4 bg-[#F5C518] text-black text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                  {service.tag}
                </div>
              )}

              <div className={service.wide ? 'lg:max-w-xl' : ''}>
                <div className="w-11 h-11 rounded-xl bg-[#F5C518]/10 flex items-center justify-center mb-4 group-hover:bg-[#F5C518]/18 transition-colors">
                  <service.icon className="w-5 h-5 text-[#F5C518]" />
                </div>

                <h3
                  style={{ fontFamily: 'Oswald, sans-serif' }}
                  className="text-xl font-bold text-white mb-2 group-hover:text-[#F5C518] transition-colors"
                >
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed max-w-prose">{service.description}</p>

                <ul className={`space-y-1.5 ${service.wide ? 'sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-1.5 sm:space-y-0' : ''}`}>
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-1 h-1 rounded-full bg-[#F5C518] shrink-0" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {service.featured && (
                <div
                  className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #F5C518 0%, transparent 70%)' }}
                  aria-hidden
                />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
