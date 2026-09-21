'use client'

import {
  Award,
  Clock,
  Headphones,
  ThumbsUp,
  ShieldCheck,
  CheckCircle2,
  Compass,
  FileCheck2,
  Wrench,
  Sparkles,
} from 'lucide-react'
import Reveal from '@/components/Reveal'

const steps = [
  {
    num: '01',
    title: 'Khảo sát & Demo góc nhìn',
    desc: 'Đến tận công trình tại TP. Huế đo đạc thực tế, demo góc nhìn camera và tư vấn phương án tối ưu hoàn toàn miễn phí.',
    icon: Compass,
    badge: 'Trong vòng 2h',
  },
  {
    num: '02',
    title: 'Báo giá trọn gói minh bạch',
    desc: 'Lên sơ đồ vị trí, danh mục thiết bị chính hãng và bảng dự toán chi tiết. Cam kết không phát sinh bất kỳ chi phí nào.',
    icon: FileCheck2,
    badge: 'Rõ ràng 100%',
  },
  {
    num: '03',
    title: 'Thi công giấu dây thẩm mỹ',
    desc: 'Đội ngũ kỹ thuật lành nghề luồn ống gen, giấu dây âm tường tỉ mỉ, đảm bảo vẻ đẹp kiến trúc cho ngôi nhà của bạn.',
    icon: Wrench,
    badge: 'Chuẩn thẩm mỹ',
  },
  {
    num: '04',
    title: 'Bàn giao & Bảo hành 24/7',
    desc: 'Cài đặt app quản lý trên điện thoại cho tất cả thành viên, kiểm tra hệ thống và kích hoạt bảo hành chính hãng 1 đổi 1.',
    icon: Headphones,
    badge: 'Hỗ trợ dài lâu',
  },
]

const reasons = [
  {
    icon: Award,
    title: 'Thiết bị chính hãng 100%',
    desc: 'Phân phối chính hãng Hikvision, Dahua, Ezviz, Kaadas, UniFi với đầy đủ CO/CQ và tem bảo hành nhà sản xuất.',
  },
  {
    icon: Clock,
    title: 'Hỗ trợ nhanh < 2 giờ',
    desc: 'Đội ngũ kỹ thuật túc trực tại TP. Huế, sẵn sàng có mặt xử lý sự cố an ninh và mạng nhanh chóng.',
  },
  {
    icon: Headphones,
    title: 'Tư vấn đúng nhu cầu',
    desc: 'Khảo sát thực tế, đề xuất giải pháp tối ưu theo ngân sách, tuyệt đối không vẽ vời hay nâng khống cấu hình.',
  },
  {
    icon: ThumbsUp,
    title: 'Thi công chuẩn thẩm mỹ',
    desc: 'Quy chuẩn đi dây cẩn thận, thiết bị căn chỉnh ngay ngắn, thẩm mỹ cao cho biệt thự, văn phòng và nhà hàng.',
  },
]

export default function ProcessSection() {
  return (
    <section id="quy-trinh" className="section-y bg-brand-soft border-y border-brand-border/60">
      <div className="container-page space-y-16 sm:space-y-20">
        
        {/* Phần 1: Quy trình 4 bước làm việc */}
        <div>
          <Reveal className="max-w-2xl mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-brand-navy text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-navy" />
              Quy trình chuẩn mực
            </div>
            <h2 className="font-heading text-[1.75rem] sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
              Quy trình làm việc chuyên nghiệp
            </h2>
            <p className="text-brand-muted leading-relaxed text-[15px] sm:text-base">
              Từ khảo sát tận nơi đến bàn giao và bảo hành, từng bước đều minh bạch giúp bạn hoàn toàn an tâm khi triển khai.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.05}>
                <div className="h-full bg-white rounded-2xl sm:rounded-[22px] p-6 border border-brand-border shadow-soft flex flex-col justify-between group hover:border-brand-yellow/60 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-2xl sm:text-3xl text-brand-yellow font-tabular">
                        {step.num}
                      </span>
                      <span className="text-[11px] font-bold text-brand-navy bg-brand-soft px-2.5 py-1 rounded-lg">
                        {step.badge}
                      </span>
                    </div>
                    
                    <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand-navy group-hover:bg-brand-yellow group-hover:text-brand-navy transition-colors">
                      <step.icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>

                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Phần 2: Đối tác an ninh tin cậy tại Huế (Why Us & Commitments) */}
        <div className="pt-10 border-t border-brand-border/80">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            {/* Cột trái: Thông điệp đối tác & Cam kết vàng (5 cols) */}
            <Reveal className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-border text-brand-navy text-xs font-bold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow-dark" />
                  Uy tín & Cam kết
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy mb-3">
                  Đối tác an ninh đáng tin cậy tại TP. Huế
                </h3>
                <p className="text-brand-muted leading-relaxed text-sm sm:text-base">
                  Với hơn 12 năm kinh nghiệm thực chiến, chúng tôi tự hào đồng hành bảo vệ bình yên cho các gia đình và cơ sở kinh doanh tại Cố Đô.
                </p>
              </div>

              {/* Cam kết vàng Card */}
              <div className="rounded-[22px] bg-brand-navy text-white p-6 sm:p-7 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-yellow text-brand-navy flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="font-heading font-bold text-sm sm:text-base text-brand-yellow">
                    Cam kết chất lượng Camera 247
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-white/80 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                    <span>Khảo sát & tư vấn góc nhìn tận nơi 100% miễn phí</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                    <span>Bảo hành chính hãng 12 – 24 tháng 1 đổi 1</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                    <span>Kỹ thuật viên túc trực hỗ trợ trong vòng 2 giờ</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Cột phải: 4 Thẻ lý do bảo chứng (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reasons.map((r, i) => (
                <Reveal key={r.title} delay={0.06 + i * 0.05}>
                  <div className="h-full rounded-[20px] border border-brand-border bg-white p-5 sm:p-6 shadow-soft flex flex-col justify-between hover:border-brand-navy/30 transition-all">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-navy">
                        <r.icon className="w-5 h-5 text-brand-navy" strokeWidth={1.75} />
                      </div>
                      <h4 className="font-heading font-extrabold text-base text-brand-navy">
                        {r.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
