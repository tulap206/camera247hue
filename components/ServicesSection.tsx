'use client'

import Image from 'next/image'
import { Camera, Lock, Wifi, Bell, Monitor, Cpu, ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { SITE_IMAGES } from '@/lib/siteImages'

const services = [
  {
    icon: Camera,
    title: 'Camera an ninh',
    description: 'Hệ thống giám sát HD/4K Hikvision, Dahua, Panasonic. Xem từ xa qua ứng dụng.',
  },
  {
    icon: Lock,
    title: 'Khóa cửa thông minh',
    description: 'Mở bằng vân tay, thẻ, mật mã hoặc điện thoại. Nhật ký ra vào và báo động đột nhập.',
  },
  {
    icon: Wifi,
    title: 'Hệ thống mạng',
    description: 'Wifi phủ sóng ổn định cho cafe, khách sạn, văn phòng. Cabling chuẩn Cat6/6A.',
  },
  {
    icon: Bell,
    title: 'Báo trộm và định vị',
    description: 'Cảm biến chuyển động, hàng rào điện tử, định vị GPS xe máy và ô tô.',
  },
  {
    icon: Monitor,
    title: 'Máy chấm công',
    description: 'Chấm công vân tay, thẻ từ, cổng từ an ninh kèm phần mềm quản lý.',
  },
  {
    icon: Cpu,
    title: 'Máy tính và thiết bị',
    description: 'Sửa chữa, bảo trì máy tính, máy in và thiết bị mạng tận nơi.',
  },
]

export default function ServicesSection() {
  return (
    <section id="dich-vu" className="section-y bg-white">
      <div className="container-page">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start mb-8 sm:mb-14">
          <Reveal className="lg:col-span-5">
            <h2 className="font-heading text-[1.65rem] sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3 sm:mb-4">
              Dịch vụ công nghệ an ninh toàn diện
            </h2>
            <p className="text-brand-muted leading-relaxed max-w-[42ch] mb-5 text-[15px] sm:text-base">
              Một địa chỉ cho lắp đặt, thi công và bảo trì. Phù hợp nhà ở, quán cafe, khách sạn và doanh nghiệp.
            </p>
            <a href="#lien-he" className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm">
              Nhận tư vấn khảo sát
              <ArrowRight className="w-4 h-4" />
            </a>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7">
            <div className="group relative rounded-2xl sm:rounded-[24px] overflow-hidden bg-brand-navy ring-1 ring-black/5 shadow-soft">
              <div className="relative aspect-[16/11] sm:aspect-[16/10] overflow-hidden">
                <Image
                  src={SITE_IMAGES.services.src}
                  alt={SITE_IMAGES.services.alt}
                  fill
                  className="object-cover object-[center_30%] storefront-zoom"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07131F]/85 via-[#07131F]/15 to-transparent pointer-events-none" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <p className="text-white font-heading font-bold text-sm sm:text-base">Showroom Camera 247 Huế</p>
                <p className="text-white/75 text-xs sm:text-sm mt-0.5">40 Tùng Thiện Vương, Tp. Huế</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-brand-border rounded-2xl sm:rounded-[24px] overflow-hidden border border-brand-border">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 0.04} className="bg-white">
              <div className="p-5 sm:p-7 h-full">
                <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center mb-3 sm:mb-4">
                  <service.icon className="w-5 h-5 text-brand-navy" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-brand-navy mb-1.5 sm:mb-2">{service.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{service.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
