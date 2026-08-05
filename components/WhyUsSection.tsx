'use client'

import {
  Award,
  Clock,
  Headphones,
  ThumbsUp,
  Users,
  Wrench,
  MapPin,
  Phone,
  Globe,
  Facebook,
} from 'lucide-react'

const reasons = [
  {
    icon: Award,
    title: "Thương hiệu hàng đầu",
    desc: "Hikvision, Dahua, Imou, Ezviz, Unifi — phân phối chính hãng 100%.",
  },
  {
    icon: Clock,
    title: "Xử lý nhanh < 2 Giờ",
    desc: "Đội ngũ kỹ thuật túc trực xử lý sự cố an ninh tận nơi siêu tốc tại Huế.",
  },
  {
    icon: Headphones,
    title: "Tư vấn thực tế",
    desc: "Khảo sát tận nhà, đề xuất giải pháp tối ưu theo ngân sách thực tế.",
  },
  {
    icon: ThumbsUp,
    title: "Thi công chuẩn thẩm mỹ",
    desc: "Đi dây gọn gàng, thẩm mỹ cao cho biệt thự, văn phòng, nhà hàng.",
  },
  {
    icon: Users,
    title: "1,200+ Công trình",
    desc: "Hàng ngàn hộ gia đình, chuỗi cafe, khách sạn, cửa hàng đã tin tưởng.",
  },
  {
    icon: Wrench,
    title: "Bảo hành tận tâm",
    desc: "Bảo hành thiết bị lên đến 2 năm, bảo trì định kỳ suốt vòng đời hệ thống.",
  },
]

export default function WhyUsSection() {
  return (
    <section
      id="tai-sao-chon-chung-toi"
      className="scroll-mt-24 bg-[#050505] py-24 sm:py-32 relative overflow-hidden"
    >
      {/* Glow background */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#F5C518]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid items-start gap-16 lg:grid-cols-12">
          
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]"></span>
                <span className="text-zinc-400 text-[10px] tracking-[0.2em] font-extrabold uppercase">Uy Tín</span>
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl font-black text-white leading-none tracking-tight">
                ĐỐI TÁC AN NINH TIN CẬY TẠI HUẾ
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[45ch] font-medium">
                Với hơn 12 năm kinh nghiệm tích hợp hệ thống, chúng tôi tự hào đồng hành bảo vệ bình yên 
                cho các gia đình và tối ưu hóa hạ tầng vận hành của doanh nghiệp tại Cố đô.
              </p>
            </div>

            {/* Business Card (Double-Bezel) */}
            <div className="p-1 bg-white/[0.02] border border-white/10 rounded-3xl relative overflow-hidden shadow-xl max-w-sm">
              <div className="bg-[#0D0E10] border border-white/5 rounded-[calc(1.5rem+0.25rem)] p-6 space-y-4">
                <h4 className="font-heading text-xs font-black tracking-widest text-[#F5C518] uppercase">
                  CAMERA 247 HUẾ
                </h4>
                <div className="space-y-3 text-xs text-zinc-400 font-medium">
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-[#F5C518]" strokeWidth={1.5} />
                    <span>40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Phone className="mt-0.5 w-4 h-4 shrink-0 text-[#F5C518]" strokeWidth={1.5} />
                    <span>0967 611 112 — 0777 611 112</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Globe className="mt-0.5 w-4 h-4 shrink-0 text-[#F5C518]" strokeWidth={1.5} />
                    <span>camera247hue.com</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Facebook className="mt-0.5 w-4 h-4 shrink-0 text-[#F5C518]" strokeWidth={1.5} />
                    <span>facebook.com/Camera247Hue</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols - reasons cards) */}
          <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className="p-1 bg-white/[0.01] border border-white/5 rounded-2xl transition-all duration-500 hover:border-[#F5C518]/20 hover:-translate-y-0.5 shadow-md flex flex-col justify-between"
              >
                <div className="bg-[#0D0E10]/40 rounded-[calc(1rem+0.125rem)] p-5 flex gap-4">
                  <div className="flex w-9 h-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/10">
                    <r.icon className="w-4 h-4 text-[#F5C518]" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white font-heading tracking-wide uppercase">{r.title}</h4>
                    <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
