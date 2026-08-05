'use client'

import { Camera, Wifi, Lock, Bell, Monitor, Cpu, ArrowUpRight } from 'lucide-react'

export default function ServicesSection() {
  return (
    <section id="dich-vu" className="scroll-mt-24 bg-[#050505] py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,197,24,0.02),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]"></span>
            <span className="text-zinc-400 text-[10px] tracking-[0.2em] font-extrabold uppercase">Dịch Vụ</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white leading-none tracking-tight">
            GIẢI PHÁP CÔNG NGHỆ BẢO AN
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-[50ch] font-medium">
            Từ lắp đặt camera quan sát, kiểm soát cửa thông minh đến hạ tầng mạng nội bộ — 
            đáp ứng hoàn hảo mọi tiêu chuẩn bảo mật cho gia đình và doanh nghiệp.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* 1. Camera an ninh (col-span-2) */}
          <div className="md:col-span-2 p-1.5 bg-white/[0.02] border border-white/10 rounded-[2.2rem] transition-all duration-500 hover:border-white/15 shadow-xl relative group">
            <div className="bg-[#0D0E10] border border-white/5 rounded-[calc(2.2rem-0.375rem)] p-8 h-full flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] min-h-[300px]">
              <div className="absolute -right-16 -bottom-16 w-52 h-52 rounded-full bg-[#F5C518]/5 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 bg-white/[0.04] border border-white/15 rounded-2xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#F5C518]" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white font-heading tracking-wide">CAMERA AN NINH GIÁM SÁT</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-md font-medium">
                    Thi công hệ thống camera giám sát thông minh 4K, AI phát hiện chuyển động con người. 
                    Tích hợp lưu trữ đám mây, quản lý từ xa tiện lợi trên ứng dụng điện thoại.
                  </p>
                </div>
                
                {/* Micro tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Camera IP 4K', 'Đàm thoại 2 chiều', 'Báo động AI', 'Thương hiệu Hikvision/Dahua'].map((tag) => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 relative z-10">
                <a
                  href="#lien-he"
                  className="inline-flex items-center gap-2 text-white hover:text-[#F5C518] text-[10px] tracking-widest uppercase font-extrabold transition-colors group/btn"
                >
                  <span>Nhận báo giá chi tiết</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>

          {/* 2. Khóa cửa thông minh (col-span-1) */}
          <div className="p-1.5 bg-white/[0.02] border border-white/10 rounded-[2.2rem] transition-all duration-500 hover:border-white/15 shadow-xl relative">
            <div className="bg-[#0D0E10] border border-white/5 rounded-[calc(2.2rem-0.375rem)] p-8 h-full flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] min-h-[300px]">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white/[0.04] border border-white/15 rounded-2xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#F5C518]" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white font-heading tracking-wide">KHÓA CỬA THÔNG MINH</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    Giải pháp kiểm soát ra vào bảo mật cao: Vân tay sinh trắc học, thẻ từ mã hóa, 
                    mã số ảo và quản lý đóng mở từ xa qua Wifi.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="#lien-he"
                  className="inline-flex items-center gap-2 text-white hover:text-[#F5C518] text-[10px] tracking-widest uppercase font-extrabold transition-colors group/btn"
                >
                  <span>Chi tiết</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>

          {/* 3. Hệ thống mạng (col-span-1) */}
          <div className="p-1.5 bg-white/[0.02] border border-white/10 rounded-[2.2rem] transition-all duration-500 hover:border-white/15 shadow-xl relative">
            <div className="bg-[#0D0E10] border border-white/5 rounded-[calc(2.2rem-0.375rem)] p-8 h-full flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white/[0.04] border border-white/15 rounded-2xl flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-[#F5C518]" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white font-heading tracking-wide">HẠ TẦNG MẠNG & WIFI</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    Thiết kế và lắp đặt hệ thống Wifi Mesh diện rộng, Switch quản trị mạng chuyên dụng, 
                    cáp Cat6 truyền tải ổn định cho văn phòng, khách sạn, cafe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Báo trộm & Định vị (col-span-1) */}
          <div className="p-1.5 bg-white/[0.02] border border-white/10 rounded-[2.2rem] transition-all duration-500 hover:border-white/15 shadow-xl relative">
            <div className="bg-[#0D0E10] border border-white/5 rounded-[calc(2.2rem-0.375rem)] p-8 h-full flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white/[0.04] border border-white/15 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-[#F5C518]" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white font-heading tracking-wide">BÁO ĐỘNG CHỐNG TRỘM</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    Hệ thống cảm biến chuyển động hồng ngoại, cảnh báo mở cửa trái phép qua cuộc gọi điện thoại, 
                    hú còi âm lượng lớn ngăn chặn đột nhập tức thì.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Chấm công & Thiết bị văn phòng (col-span-1) */}
          <div className="p-1.5 bg-white/[0.02] border border-white/10 rounded-[2.2rem] transition-all duration-500 hover:border-white/15 shadow-xl relative">
            <div className="bg-[#0D0E10] border border-white/5 rounded-[calc(2.2rem-0.375rem)] p-8 h-full flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white/[0.04] border border-white/15 rounded-2xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-[#F5C518]" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white font-heading tracking-wide">MÁY CHẤM CÔNG</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    Giải pháp chấm công vân tay, khuôn mặt (FaceID) chuẩn xác cho công ty, nhà hàng. 
                    Cung cấp linh kiện máy tính, máy in lắp đặt và bảo hành tận nhà tại Huế.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
