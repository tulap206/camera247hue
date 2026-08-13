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
        <div className="max-w-2xl">
          <p className="font-heading font-extrabold text-brand-yellow text-base sm:text-xl tracking-tight mb-3 sm:mb-5">
            Camera 247 Huế
          </p>

          <h1 className="font-heading text-[1.85rem] leading-[1.15] sm:text-5xl lg:text-[3.5rem] sm:leading-[1.08] font-extrabold text-white tracking-tight mb-4 sm:mb-5">
            Giải pháp công nghệ an ninh cho doanh nghiệp và hộ gia đình
          </h1>

          <p className="text-white/80 text-[15px] sm:text-lg leading-relaxed max-w-[38ch] mb-6 sm:mb-8">
            Thi công camera, khóa thông minh và hệ thống mạng. Khảo sát tận nơi tại Huế.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <a href="#lien-he" className="btn-accent group w-full sm:w-auto">
              Tư vấn khảo sát
              <span className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
            <Link
              href="/cong-trinh"
              className="btn-ghost w-full sm:w-auto !border-white/30 !text-white hover:!bg-white/10"
            >
              Xem công trình
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
