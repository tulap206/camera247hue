'use client'

import { Award, Clock, Headphones, ThumbsUp, Users, Wrench, MapPin, Phone, Globe, Facebook } from 'lucide-react'

const reasons = [
  {
    icon: Award,
    title: 'Thương Hiệu Hàng Đầu',
    desc: 'Phân phối & lắp đặt chính hãng Hikvision, Dahua, Panasonic, Unifi — bảo hành đầy đủ từ nhà sản xuất.'
  },
  {
    icon: Clock,
    title: 'Giám Sát 24/7',
    desc: 'Hỗ trợ kỹ thuật liên tục 24/7. Xử lý sự cố nhanh chóng trong vòng 2 giờ tại Tp. Huế.'
  },
  {
    icon: Headphones,
    title: 'Tư Vấn Tận Tình',
    desc: 'Đội ngũ kỹ thuật viên giàu kinh nghiệm, tư vấn giải pháp phù hợp với ngân sách và nhu cầu thực tế.'
  },
  {
    icon: ThumbsUp,
    title: 'Thi Công Chuyên Nghiệp',
    desc: 'Lắp đặt gọn gàng, thẩm mỹ cao. Đi dây âm tường hoặc nổi theo yêu cầu, bàn giao đúng tiến độ.'
  },
  {
    icon: Users,
    title: 'Hơn 1200 Khách Hàng',
    desc: 'Tin tưởng bởi hàng trăm hộ gia đình, quán cafe, khách sạn, trường học và doanh nghiệp tại Huế.'
  },
  {
    icon: Wrench,
    title: 'Bảo Hành Trọn Gói',
    desc: 'Bảo hành thiết bị 12-24 tháng, bảo trì định kỳ miễn phí trong thời gian bảo hành theo hợp đồng.'
  },
]

export default function WhyUsSection() {
  return (
    <section id="tai-sao-chon-chung-toi" className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-[#F5C518] text-xs font-semibold tracking-widest uppercase">
              <span className="w-8 h-0.5 bg-[#F5C518]" />
              Tại Sao Chọn Chúng Tôi
            </div>
            
            <h2 className="font-heading text-3xl sm:text-5xl font-black text-white leading-none tracking-tight">
              ĐỐI TÁC AN NINH
              <br />
              <span className="bg-gradient-to-r from-[#F5C518] to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,197,24,0.2)]">TIN CẬY SỐ 1</span> TẠI HUẾ
            </h2>
            
            <p className="text-gray-400 text-base leading-relaxed">
              Với hơn 12 năm kinh nghiệm thực chiến trong lĩnh vực hạ tầng mạng và tích hợp hệ thống an ninh công nghệ, 
              Camera 247 Huế đã đồng hành cùng hàng nghìn hộ gia đình, biệt thự, cafe, nhà hàng, khách sạn và doanh nghiệp lớn tại Cố Đô.
            </p>

            {/* Company info box */}
            <div className="glass-panel rounded-[24px] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl" />
              <div className="font-extrabold text-[#F5C518] mb-3 text-sm tracking-wider font-heading uppercase">
                CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ AN NINH CAMERA 247 HUẾ
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm text-gray-400 font-medium">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F5C518] flex-shrink-0 mt-0.5" />
                  <span>40 Tùng Thiện Vương, Phường Vỹ Dạ, Tp. Huế</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#F5C518] flex-shrink-0 mt-0.5" />
                  <span>0967 611 112 — 0777 611 112</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-[#F5C518] flex-shrink-0 mt-0.5" />
                  <span>camera247hue.com</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Facebook className="w-4 h-4 text-[#F5C518] flex-shrink-0 mt-0.5" />
                  <span>facebook.com/Camera247Hue</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Reasons grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="group p-5 glass-panel rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all duration-300 hover:bg-white/5 hover:-translate-y-1"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F5C518] group-hover:border-transparent transition-all duration-300">
                    <r.icon className="w-5 h-5 text-[#F5C518] group-hover:text-black transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1 group-hover:text-[#F5C518] transition-colors">
                      {r.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed font-medium">{r.desc}</p>
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
