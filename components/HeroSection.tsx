'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { SITE_IMAGES } from '@/lib/siteImages'

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const [parallax, setParallax] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setParallax(mq.matches && !reduce)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [reduce])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], parallax ? [0, 28] : [0, 0])
  const imageScale = useTransform(scrollYProgress, [0, 1], parallax ? [1.02, 1.08] : [1, 1])

  const photo = (
    <Image
      src={SITE_IMAGES.hero.src}
      alt={SITE_IMAGES.hero.alt}
      fill
      priority
      className={`object-cover object-[40%_center] sm:object-[28%_center] ${parallax ? 'hero-kenburns' : ''}`}
      sizes="100vw"
    />
  )

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-end overflow-hidden bg-brand-navy"
    >
      {parallax ? (
        <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
          {photo}
        </motion.div>
      ) : (
        <div className="absolute inset-0">{photo}</div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#07131F] via-[#0B1F33]/75 to-[#07131F]/50 sm:bg-gradient-to-r sm:from-[#07131F]/94 sm:via-[#0B1F33]/72 sm:to-[#0B1F33]/28" />
      <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[#07131F]/90 via-[#0B1F33]/25 to-[#07131F]/45" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 80%, transparent 30%, rgba(7,19,31,0.5) 100%)',
        }}
        aria-hidden
      />

      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none hero-grain" aria-hidden />

      <div className="relative z-10 container-page w-full pt-[5.5rem] pb-[7.5rem] sm:pt-28 sm:pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-yellow text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5">
            <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
            Công nghệ an ninh hàng đầu tại TP. Huế
          </div>

          <h1 className="font-heading text-[1.85rem] leading-[1.15] sm:text-5xl lg:text-[3.5rem] sm:leading-[1.08] font-extrabold text-white tracking-tight mb-4 sm:mb-5">
            Giải pháp công nghệ an ninh cho doanh nghiệp và hộ gia đình
          </h1>

          <p className="text-white/85 text-[15px] sm:text-lg leading-relaxed max-w-[44ch] mb-6 sm:mb-8">
            Chuyên tư vấn, thi công camera giám sát AI, khóa cửa vân tay và hạ tầng mạng Wifi Mesh. Khảo sát tận nơi trong 2 giờ tại TP. Huế.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-8">
            <a href="#lien-he" className="btn-accent group w-full sm:w-auto">
              Nhận tư vấn khảo sát
              <span className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
            <Link
              href="/cong-trinh"
              className="btn-ghost w-full sm:w-auto !border-white/30 !text-white hover:!bg-white/10"
            >
              Xem công trình thực tế
            </Link>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-white/70">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              <span>100% Thiết bị chính hãng CO/CQ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              <span>Khảo sát đo góc camera miễn phí</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              <span>Bảo hành 1 đổi 1 tận nơi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
