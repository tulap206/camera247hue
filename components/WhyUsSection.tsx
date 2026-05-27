'use client'

import { Award, Clock, Headphones, ThumbsUp, Users, Wrench } from 'lucide-react'

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
    <section id="tai-sao-chon-chung-toi" className="py-20 bg-[#111111] relative">
      {/* Hazard stripe accent */}
      <div className="absolute top-0 left-0 right-0 h-1 hazard-stripe opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 text-[#F5C518] text-sm font-medium mb-4 tracking-widest uppercase">
              <span className="w-8 h-px bg-[#F5C518]" />
              Tại Sao Chọn Chúng Tôi
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              ĐỐI TÁC AN NINH
              <br />
              <span className="text-[#F5C518]">TIN CẬY SỐ 1</span>
              <br />
              TẠI HUẾ
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Với hơn 12 năm kinh nghiệm trong lĩnh vực an ninh công nghệ, 
              Camera 247 Huế đã và đang là đơn vị hàng đầu được tin tưởng 
              bởi hàng trăm khách hàng cá nhân và doanh nghiệp tại Cố Đô Huế.
            </p>

            {/* Company info box */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#F5C518]/20">
              <div className="font-bold text-[#F5C518] mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ AN NINH CAMERA 247 HUẾ
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <p>📍 40 Tùng Thiện Vương, Phường Vỹ Dạ, Tp. Huế</p>
                <p>📞 0967 611 112 — 0777 611 112</p>
                <p>🌐 camera247hue.com</p>
                <p>📘 Facebook.com/Camera247Hue</p>
              </div>
            </div>
          </div>

          {/* Right: Reasons grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className="group p-5 bg-[#1A1A1A] rounded-xl border border-gray-800 hover:border-[#F5C518]/40 transition-all duration-300 hover:bg-[#1F1F1F]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F5C518]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F5C518]/20 transition-colors">
                    <r.icon className="w-4.5 h-4.5 text-[#F5C518] w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1 group-hover:text-[#F5C518] transition-colors">
                      {r.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
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
