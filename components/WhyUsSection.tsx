'use client'

import { Award, Clock, Headphones, ThumbsUp, MapPin, Phone } from 'lucide-react'
import Reveal from '@/components/Reveal'

const reasons = [
  {
    icon: Award,
    title: 'Thiết bị chính hãng',
    desc: 'Phân phối và lắp đặt Hikvision, Dahua, Panasonic, UniFi với bảo hành đầy đủ.',
  },
  {
    icon: Clock,
    title: 'Hỗ trợ nhanh tại Huế',
    desc: 'Kỹ thuật viên xử lý sự cố trong vòng 2 giờ trong khu vực thành phố.',
  },
  {
    icon: Headphones,
    title: 'Tư vấn đúng nhu cầu',
    desc: 'Đề xuất giải pháp phù hợp ngân sách, không đẩy cấu hình thừa.',
  },
  {
    icon: ThumbsUp,
    title: 'Thi công thẩm mỹ',
    desc: 'Đi dây gọn gàng, lắp đặt sạch sẽ, bàn giao đúng tiến độ cam kết.',
  },
]

export default function WhyUsSection() {
  return (
    <section id="tai-sao-chon-chung-toi" className="py-24 sm:py-28 bg-white">
      <div className="container-page">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <Reveal className="lg:col-span-5">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-4">
              Đối tác an ninh đáng tin cậy tại Huế
            </h2>
            <p className="text-brand-muted leading-relaxed max-w-[46ch] mb-8">
              Hơn 12 năm triển khai hệ thống camera và công nghệ an ninh cho hộ gia đình, quán cafe,
              khách sạn và doanh nghiệp tại Cố Đô.
            </p>

            <div className="rounded-[20px] bg-brand-navy text-white p-6 sm:p-7">
              <div className="font-heading font-bold text-base mb-4 text-brand-yellow">
                Công ty TNHH Giải pháp Công nghệ An ninh Camera 247 Huế
              </div>
              <div className="space-y-3 text-sm text-white/75">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                  40 Tùng Thiện Vương, Phường Vỹ Dạ, Tp. Huế
                </p>
                <p className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                  0967 611 112 / 0777 611 112
                </p>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.05}>
                <div className="h-full rounded-[20px] border border-brand-border bg-brand-bg/60 p-6">
                  <div className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center mb-4">
                    <r.icon className="w-5 h-5 text-brand-navy" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading font-bold text-brand-navy mb-2">{r.title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
