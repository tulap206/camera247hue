"use client"

import { BlurFade } from "@/components/magicui/blur-fade"
import { NumberTicker } from "@/components/magicui/number-ticker"

const stats = [
  { value: 1200, suffix: "+", label: "Công trình hoàn thành", desc: "Trên toàn Tp. Huế và vùng lân cận" },
  { value: 12, suffix: "+", label: "Năm kinh nghiệm", desc: "Chuyên sâu lĩnh vực an ninh" },
  { value: 24, suffix: "/7", label: "Hỗ trợ kỹ thuật", desc: "Liên tục không gián đoạn" },
  { value: 98, suffix: "%", label: "Khách hàng hài lòng", desc: "Tỷ lệ phản hồi tích cực" },
]

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 py-16 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-[#111115] to-[#070708]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((s, i) => (
            <BlurFade key={s.label} inView delay={0.05 * i} direction="up">
              <div className="rounded-2xl border border-white/5 bg-[#0f0f12]/80 p-5 text-center sm:p-6">
                <div className="font-heading text-3xl font-bold text-[#F5C518] sm:text-4xl">
                  <NumberTicker value={s.value} className="font-heading text-[#F5C518]" />
                  <span>{s.suffix}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">{s.label}</p>
                <p className="mt-1 text-xs text-zinc-500">{s.desc}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
