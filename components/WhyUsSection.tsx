'use client'

import { Award, Clock, Headphones, ThumbsUp, Users, Wrench, MapPin, Phone, Globe, Facebook } from 'lucide-react'
import Reveal from '@/components/Reveal'

const reasons = [
  {
    icon: Award,
    title: 'Thương Hiệu Hàng Đầu',
    desc: 'Phân phối chính hãng Hikvision, Dahua, Panasonic, Unifi. Bảo hành đầy đủ từ nhà sản xuất.',
  },
  {
    icon: Clock,
    title: 'Giám Sát 24/7',
    desc: 'Hỗ trợ kỹ thuật liên tục. Xử lý sự cố trong vòng 2 giờ tại Tp. Huế.',
  },
  {
    icon: Headphones,
    title: 'Tư Vấn Tận Tình',
    desc: 'Kỹ thuật viên giàu kinh nghiệm, tư vấn giải pháp phù hợp ngân sách thực tế.',
  },
  {
    icon: ThumbsUp,
    title: 'Thi Công Chuyên Nghiệp',
    desc: 'Lắp đặt gọn gàng, thẩm mỹ cao. Đi dây âm tường hoặc nổi theo yêu cầu.',
  },
  {
    icon: Users,
    title: 'Hơn 1200 Khách Hàng',
    desc: 'Tin tưởng bởi hộ gia đình, quán cafe, khách sạn, trường học và doanh nghiệp tại Huế.',
  },
  {
    icon: Wrench,
    title: 'Bảo Hành Trọn Gói',
    desc: 'Bảo hành thiết bị 12-24 tháng, bảo trì định kỳ miễn phí theo hợp đồng.',
  },
]

const companyDetails = [
  { icon: MapPin, text: '40 Tùng Thiện Vương, Phường Vỹ Dạ, Tp. Huế' },
  { icon: Phone, text: '0967 611 112 / 0777 611 112' },
  { icon: Globe, text: 'camera247hue.com' },
  { icon: Facebook, text: 'Facebook.com/Camera247Hue' },
]

export default function WhyUsSection() {
  return (
    <section id="tai-sao-chon-chung-toi" className="py-20 sm:py-24 bg-[#0F0F0F] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5C518]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Reveal>
            <h2
              style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight tracking-tight"
            >
              ĐỐI TÁC AN NINH
              <span className="text-[#F5C518]"> TIN CẬY</span> TẠI HUẾ
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-[52ch]">
              Hơn 12 năm kinh nghiệm trong lĩnh vực an ninh công nghệ. Camera 247 Huế là đơn vị được tin
              tưởng bởi hàng trăm khách hàng cá nhân và doanh nghiệp tại Cố Đô.
            </p>

            <div className="surface-card p-5 border-[#F5C518]/20">
              <div
                className="font-bold text-[#F5C518] mb-3 text-sm leading-snug"
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ AN NINH CAMERA 247 HUẾ
              </div>
              <div className="space-y-2.5 text-sm text-gray-400">
                {companyDetails.map((item) => (
                  <p key={item.text} className="flex items-start gap-2.5">
                    <item.icon className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" aria-hidden />
                    <span>{item.text}</span>
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.05}>
                <div className="group surface-card p-5 h-full hover:bg-[#1C1C1C]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F5C518]/10 flex items-center justify-center shrink-0 group-hover:bg-[#F5C518]/18 transition-colors">
                      <r.icon className="w-4 h-4 text-[#F5C518]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-[#F5C518] transition-colors">
                        {r.title}
                      </h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
