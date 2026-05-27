'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 500, suffix: '+', label: 'Công Trình Hoàn Thành', desc: 'Trên toàn Tp. Huế và vùng lân cận' },
  { value: 10, suffix: '+', label: 'Năm Kinh Nghiệm', desc: 'Chuyên sâu trong lĩnh vực an ninh' },
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

function StatCard({ value, suffix, label, desc, started }: typeof stats[0] & { started: boolean }) {
  const count = useCountUp(value, 1800, started)
  return (
    <div className="text-center group">
      <div className="text-4xl sm:text-5xl font-bold text-[#F5C518] mb-1 group-hover:scale-110 transition-transform inline-block"
        style={{ fontFamily: 'Oswald, sans-serif', textShadow: '0 0 30px rgba(245,197,24,0.3)' }}>
        {count}{suffix}
      </div>
      <div className="text-white font-semibold mb-1">{label}</div>
      <div className="text-gray-500 text-sm">{desc}</div>
    </div>
  )
}

export default function StatsSection() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-16 relative overflow-hidden" ref={ref}>
      {/* Dark bg with yellow gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A1000] via-[#0D0D0D] to-[#1A1000]" />
      <div className="absolute inset-0 hazard-stripe opacity-5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} started={started} />
          ))}
        </div>
      </div>
    </section>
  )
}
