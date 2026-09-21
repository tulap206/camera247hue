'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Compass,
  FileCheck2,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
  Clock,
  Award,
  Users,
} from 'lucide-react'
import Reveal from '@/components/Reveal'

const steps = [
  {
    num: '01',
    title: 'Khảo sát tận nơi',
    desc: 'Đo đạc hiện trạng, demo góc nhìn thực tế tại công trình TP. Huế và tư vấn phương án tối ưu hoàn toàn miễn phí.',
    icon: Compass,
    badge: 'Miễn phí 100%',
    highlight: 'Có mặt trong vòng 2h',
  },
  {
    num: '02',
    title: 'Báo giá rõ ràng',
    desc: 'Đề xuất danh mục thiết bị chính hãng và bảng dự toán chi phí minh bạch, chuẩn ngân sách. Không phát sinh.',
    icon: FileCheck2,
    badge: 'Minh bạch 100%',
    highlight: 'Cam kết giá trọn gói',
  },
  {
    num: '03',
    title: 'Thi công chuẩn kỹ thuật',
    desc: 'Đội ngũ lành nghề thi công giấu dây, luồn ống gen tỉ mỉ, căn chỉnh góc nhìn sắc nét và bàn giao đúng tiến độ.',
    icon: Wrench,
    badge: 'Chuẩn thẩm mỹ',
    highlight: 'Giấu dây âm tường',
  },
  {
    num: '04',
    title: 'Bảo hành & Hỗ trợ 24/7',
    desc: 'Cài đặt app trên điện thoại cho từng thành viên, hướng dẫn sử dụng và kích hoạt bảo hành chính hãng 12–24 tháng 1 đổi 1.',
    icon: ShieldCheck,
    badge: 'Bảo hành 1 đổi 1',
    highlight: 'Hỗ trợ kỹ thuật 24/7',
  },
]

const stats = [
  {
    value: 1200,
    suffix: '+',
    label: 'Công trình hoàn thành',
    sub: 'Nhà phố, biệt thự, nhà hàng, khách sạn',
    icon: Award,
  },
  {
    value: 12,
    suffix: '+',
    label: 'Năm kinh nghiệm',
    sub: 'Thực chiến thi công an ninh tại Huế',
    icon: Clock,
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Hỗ trợ kỹ thuật',
    sub: 'Xử lý sự cố tận nơi trong ngày',
    icon: Wrench,
  },
  {
    value: 98,
    suffix: '%',
    label: 'Khách hàng hài lòng',
    sub: 'Đánh giá cao chất lượng thi công',
    icon: Users,
  },
]

function useCountUp(target: number, duration = 1800, started: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return count
}

function StatCounterItem({
  value,
  suffix,
  label,
  sub,
  icon: Icon,
  started,
}: (typeof stats)[0] & { started: boolean }) {
  const count = useCountUp(value, 1600, started)
  return (
    <div className="relative p-4 sm:p-6 rounded-2xl bg-white border border-brand-border/80 shadow-soft hover:border-brand-yellow/80 hover:shadow-lift transition-all duration-300 group">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-soft group-hover:bg-brand-yellow/20 flex items-center justify-center transition-colors">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-navy group-hover:text-brand-yellow-dark" />
        </div>
        <span className="w-2 h-2 rounded-full bg-brand-yellow" />
      </div>

      <div className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy tracking-tight font-tabular mb-1">
        {count}
        <span className="text-brand-yellow-dark">{suffix}</span>
      </div>
      <div className="font-heading font-bold text-xs sm:text-base text-brand-navy mb-1 leading-snug">
        {label}
      </div>
      <p className="text-[10px] sm:text-xs text-brand-muted leading-relaxed line-clamp-2">
        {sub}
      </p>
    </div>
  )
}

export default function ProcessSection() {
  const [statsStarted, setStatsStarted] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsStarted(true)
      },
      { threshold: 0.25 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="quy-trinh" className="section-y bg-brand-soft border-y border-brand-border/60 relative overflow-hidden">
      <div className="container-page space-y-12 sm:space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-brand-navy text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow-dark" />
              Quy trình chuẩn mực
            </div>
            <h2 className="font-heading text-[1.75rem] sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
              Quy trình làm việc chuyên nghiệp
            </h2>
            <p className="text-brand-muted leading-relaxed text-sm sm:text-base">
              Từ khảo sát thực tế đến bàn giao và bảo hành tận nơi tại TP. Huế, từng bước đều minh bạch để bạn hoàn toàn yên tâm triển khai.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="hidden md:flex items-center gap-3 shrink-0 pb-1">
            <div className="text-right">
              <div className="text-xs font-bold text-brand-navy">Tư vấn kỹ thuật 24/7</div>
              <div className="text-xs text-brand-muted">Khảo sát miễn phí tại TP. Huế</div>
            </div>
            <a
              href="tel:0796785151"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-brand-border hover:border-brand-yellow text-brand-navy font-bold text-xs sm:text-sm shadow-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-yellow-dark" />
              <span>0796 785 151</span>
            </a>
          </Reveal>
        </div>

        {/* 4-Step Cards Grid with Connecting Visual Flow */}
        <div className="relative">
          {/* Subtle Desktop Connector Line */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-brand-border/40 via-brand-yellow/50 to-brand-border/40 -translate-y-6 pointer-events-none z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative z-10">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.05}>
                <div className="h-full bg-white rounded-2xl sm:rounded-[22px] p-5 sm:p-6 border border-brand-border shadow-soft hover:border-brand-yellow hover:shadow-lift transition-all duration-300 flex flex-col justify-between group relative">
                  
                  <div>
                    {/* Top Step Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-heading font-black text-3xl sm:text-4xl text-brand-yellow group-hover:scale-110 transition-transform font-tabular">
                        {step.num}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-brand-navy bg-brand-soft group-hover:bg-brand-yellow/20 px-2.5 py-1 rounded-full border border-brand-border/60 transition-colors">
                        {step.badge}
                      </span>
                    </div>

                    {/* Step Icon */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-soft group-hover:bg-brand-navy group-hover:text-white flex items-center justify-center text-brand-navy mb-4 transition-colors">
                      <step.icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Step Footer Highlight */}
                  <div className="pt-4 mt-5 border-t border-brand-border/60 flex items-center gap-1.5 text-[11px] font-bold text-brand-navy">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow-dark shrink-0" />
                    <span>{step.highlight}</span>
                  </div>

                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Integrated Stats & Credibility Section */}
        <div ref={statsRef} className="pt-4 sm:pt-6">
          <Reveal>
            <div className="rounded-2xl sm:rounded-[24px] bg-brand-navy text-white p-5 sm:p-8 lg:p-10 shadow-lift relative overflow-hidden">
              {/* Background Ambient Glow */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6 sm:space-y-8">
                {/* Stats Top Banner Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 sm:pb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-brand-yellow text-xs font-bold uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Năng lực thực tế
                    </div>
                    <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                      Con số khẳng định uy tín tại TP. Huế
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 max-w-md">
                    Hơn một thập kỷ đồng hành cùng hàng ngàn khách hàng cá nhân và doanh nghiệp tại Cố Đô.
                  </p>
                </div>

                {/* 4 Stat Boxes (Clean White on Navy Background: 2x2 on Mobile, 4x1 on Desktop) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  {stats.map((s) => (
                    <StatCounterItem key={s.label} {...s} started={statsStarted} />
                  ))}
                </div>

                {/* Bottom Callout Strip */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-white/80 text-center sm:text-left">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                    <span>Cam kết thiết bị chính hãng 100% – Hỗ trợ kỹ thuật tận nơi trong vòng 2 giờ.</span>
                  </div>
                  <a
                    href="#lien-he"
                    className="btn-accent inline-flex items-center gap-2 !py-2.5 !px-5 !text-xs shrink-0 w-full sm:w-auto justify-center"
                  >
                    <span>Yêu cầu khảo sát ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
