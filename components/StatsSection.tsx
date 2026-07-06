'use client'

import { useEffect, useRef, useState } from 'react'
import Reveal from '@/components/Reveal'

const stats = [
  { value: 1200, suffix: '+', label: 'Công Trình Hoàn Thành', desc: 'Trên toàn Tp. Huế và vùng lân cận' },
  { value: 12, suffix: '+', label: 'Năm Kinh Nghiệm', desc: 'Chuyên sâu trong lĩnh vực an ninh' },
  { value: 24, suffix: '/7', label: 'Hỗ Trợ Kỹ Thuật', desc: 'Liên tục không gián đoạn' },
  { value: 98, suffix: '%', label: 'Khách Hàng Hài Lòng', desc: 'Tỷ lệ phản hồi tích cực' },
]

function useCountUp(target: number, duration = 2000, started: boolean) {
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

function StatCard({ value, suffix, label, desc, started }: (typeof stats)[0] & { started: boolean }) {
  const count = useCountUp(value, 1800, started)
  return (
    <div className="text-center lg:text-left surface-card p-6">
      <div
        className="text-4xl sm:text-5xl font-bold text-[#F5C518] mb-2 font-tabular"
        style={{ fontFamily: 'Oswald, sans-serif' }}
      >
        {count}
        {suffix}
      </div>
      <div className="text-white font-semibold mb-1 text-sm">{label}</div>
      <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
    </div>
  )
}

export default function StatsSection() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStarted(true)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-14 sm:py-16 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,197,24,0.08) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} started={started} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
