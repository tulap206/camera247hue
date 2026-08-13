'use client'

import Image from 'next/image'
import { Camera, Lock, Wifi, Bell, Monitor, Cpu, ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'

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
    <section id="dich-vu" className="py-24 sm:py-28 bg-white">
      <div className="container-page">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-14">
          <Reveal className="lg:col-span-5">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-4">
              Dịch vụ công nghệ an ninh toàn diện
            </h2>
            <p className="text-brand-muted leading-relaxed max-w-[42ch] mb-6">
              Một địa chỉ cho lắp đặt, thi công và bảo trì. Phù hợp nhà ở, quán cafe, khách sạn và doanh nghiệp.
            </p>
            <a href="#lien-he" className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm hover:gap-3 transition-all duration-300 ease-out">
              Nhận tư vấn khảo sát
              <ArrowRight className="w-4 h-4" />
            </a>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7">
            <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden bg-brand-soft">
              <Image
                src="https://picsum.photos/seed/camera247hue-service-room/1200/750"
                alt="Thi công hệ thống camera và mạng tại công trình"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-brand-border rounded-[24px] overflow-hidden border border-brand-border">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 0.04} className="bg-white">
              <div className="p-7 h-full hover:bg-brand-bg/80 transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center mb-4">
                  <service.icon className="w-5 h-5 text-brand-navy" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-bold text-lg text-brand-navy mb-2">{service.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed max-w-[36ch]">{service.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
