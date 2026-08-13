'use client'

import { useEffect, useRef, useState } from 'react'
import Reveal from '@/components/Reveal'

const stats = [
  { value: 1200, suffix: '+', label: 'Công trình hoàn thành' },
  { value: 12, suffix: '+', label: 'Năm kinh nghiệm' },
  { value: 24, suffix: '/7', label: 'Hỗ trợ kỹ thuật' },
  { value: 98, suffix: '%', label: 'Khách hàng hài lòng' },
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

function StatItem({ value, suffix, label, started }: (typeof stats)[0] & { started: boolean }) {
  const count = useCountUp(value, 1600, started)
  return (
    <div className="text-center sm:text-left py-2">
      <div className="font-heading text-4xl sm:text-5xl font-extrabold text-brand-navy tracking-tight font-tabular mb-2">
        {count}
        <span className="text-brand-yellow">{suffix}</span>
      </div>
      <div className="text-sm text-brand-muted">{label}</div>
    </div>
  )
}

export default function StatsSection() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true)
      },
      { threshold: 0.35 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-20 bg-white border-y border-brand-border" ref={ref}>
      <div className="container-page">
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {stats.map((s) => (
              <StatItem key={s.label} {...s} started={started} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
