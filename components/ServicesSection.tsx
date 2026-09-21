'use client'

import Image from 'next/image'
import {
  Camera,
  Lock,
  Wifi,
  Bell,
  Monitor,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Phone,
} from 'lucide-react'
import Reveal from '@/components/Reveal'
import { SITE_IMAGES } from '@/lib/siteImages'

const highlights = [
  {
    title: 'Khảo sát & demo góc nhìn miễn phí',
    desc: 'Kỹ thuật viên đo đạc thực tế tại TP. Huế trong vòng 2 giờ.',
  },
  {
    title: '100% Thiết bị chính hãng CO/CQ',
    desc: 'Phân phối từ Hikvision, Dahua, KBVISION, Ezviz, UniFi, Ruijie.',
  },
  {
    title: 'Thi công giấu dây chuẩn thẩm mỹ',
    desc: 'Đi dây âm tường, ống gen tỉ mỉ cho nhà phố, biệt thự và văn phòng.',
  },
  {
    title: 'Bảo hành 12 – 24 tháng 1 đổi 1',
    desc: 'Bảo trì định kỳ và hỗ trợ kỹ thuật tận nơi nhanh chóng.',
  },
]

const services = [
  {
    icon: Camera,
    title: 'Camera an ninh AI',
    description: 'Hệ thống giám sát Ultra HD 4K Hikvision, Dahua, KBVISION. Nhận diện người, xe và xem ban đêm có màu 24/7.',
    badge: 'Phổ biến nhất',
  },
  {
    icon: Lock,
    title: 'Khóa cửa thông minh',
    description: 'Mở bằng FaceID 3D, vân tay sinh trắc học FPC, thẻ từ mã hóa hoặc qua App. Báo động khi có xâm nhập trái phép.',
    badge: 'Bảo mật cao',
  },
  {
    icon: Wifi,
    title: 'Hệ thống mạng & Wifi Mesh',
    description: 'Wifi Roaming phủ sóng liền mạch, chịu tải cao cho nhà hàng, cafe, khách sạn. Thi công cáp mạng Cat6 chuẩn Gigabit.',
    badge: 'Tốc độ cao',
  },
  {
    icon: Bell,
    title: 'Báo trộm & Định vị GPS',
    description: 'Cảm biến chuyển động hồng ngoại PIR, cảm biến mở cửa, hàng rào điện tử cảnh báo còi hú và tự động gọi điện thoại.',
    badge: 'An toàn 24/7',
  },
  {
    icon: Monitor,
    title: 'Máy chấm công FaceID',
    description: 'Chấm công nhận diện khuôn mặt AI chống gian lận, vân tay và thẻ từ cho công ty, nhà hàng kèm xuất báo cáo Excel.',
    badge: 'Chính xác',
  },
  {
    icon: Cpu,
    title: 'Máy tính & Thiết bị văn phòng',
    description: 'Cung cấp linh kiện máy tính, lắp đặt và sửa chữa máy in, bảo trì hệ thống công nghệ thông tin tận nơi tại TP. Huế.',
    badge: 'Tận nơi',
  },
]

export default function ServicesSection() {
  return (
    <section id="dich-vu" className="section-y bg-white">
      <div className="container-page">
        {/* Top Split: Left Content + Right Showroom Photo */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          
          {/* Cột trái: Tiêu đề + Giá trị nổi bật + CTA (5 cols) */}
          <Reveal className="lg:col-span-5 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-brand-navy text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-brand-yellow-dark" />
                Giải pháp an ninh toàn diện
              </div>
              <h2 className="font-heading text-[1.75rem] sm:text-4xl font-extrabold tracking-tight text-brand-navy leading-tight">
                Dịch vụ công nghệ an ninh trọn gói tại TP. Huế
              </h2>
            </div>

            <p className="text-brand-muted leading-relaxed text-sm sm:text-base">
              Địa chỉ uy tín hàng đầu cho nhu cầu tư vấn, thi công và bảo trì hệ thống camera giám sát, khóa cửa thông minh và mạng nội bộ cho gia đình, nhà hàng, khách sạn và doanh nghiệp.
            </p>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="p-3 rounded-xl bg-brand-bg/80 border border-brand-border/70 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow-dark shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted leading-relaxed pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href="#lien-he" className="btn-accent inline-flex items-center gap-2 !py-2.5 !px-5 !text-sm">
                <span>Nhận tư vấn khảo sát</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:0796785151"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border hover:border-brand-yellow text-brand-navy font-semibold text-xs sm:text-sm transition-colors bg-white shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-brand-yellow-dark" />
                <span>0796 785 151 (Tước)</span>
              </a>
            </div>
          </Reveal>

          {/* Cột phải: Hình ảnh Showroom thực tế (7 cols) */}
          <Reveal delay={0.08} className="lg:col-span-7">
            <div className="group rounded-2xl sm:rounded-[24px] bg-white p-2 sm:p-2.5 ring-1 ring-brand-border shadow-soft hover:shadow-lift transition-shadow duration-500 ease-out relative">
              <div className="relative overflow-hidden rounded-xl sm:rounded-[20px]">
                <Image
                  src={SITE_IMAGES.services.src}
                  alt={SITE_IMAGES.services.alt}
                  width={1536}
                  height={1024}
                  quality={100}
                  className="w-full h-auto block object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                
                {/* Image Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto bg-brand-navy/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/10 shadow-lg flex items-center gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span className="font-semibold">Showroom: 40 Tùng Thiện Vương, Vỹ Dạ, TP. Huế</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom: 6 Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 0.04}>
              <div className="p-6 sm:p-7 h-full bg-white rounded-2xl sm:rounded-[22px] border border-brand-border shadow-soft hover:border-brand-yellow hover:shadow-lift transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-brand-soft group-hover:bg-brand-yellow/20 flex items-center justify-center transition-colors">
                      <service.icon className="w-5 h-5 text-brand-navy group-hover:text-brand-yellow-dark" strokeWidth={1.75} />
                    </div>
                    <span className="text-[10px] font-bold text-brand-navy bg-brand-soft px-2.5 py-1 rounded-full border border-brand-border/60">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-brand-navy mb-2 group-hover:text-brand-navy">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-brand-border/60 flex items-center justify-between">
                  <a
                    href="#lien-he"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-yellow-dark transition-colors"
                  >
                    <span>Yêu cầu khảo sát</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[10px] text-brand-muted font-medium">TP. Huế</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
