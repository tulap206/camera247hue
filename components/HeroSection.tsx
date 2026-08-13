'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { SITE_IMAGES } from '@/lib/siteImages'

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 80])
  const imageScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.08, 1.18])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.35])

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] flex items-end overflow-hidden bg-brand-navy">
      {/* Background image + Ken Burns / parallax */}
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <Image
          src={SITE_IMAGES.hero.src}
          alt={SITE_IMAGES.hero.alt}
          fill
          priority
          className={`object-cover object-[28%_center] ${reduce ? '' : 'hero-kenburns'}`}
          sizes="100vw"
        />
      </motion.div>

      {/* Brand navy wash - heavier on left for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07131F]/94 via-[#0B1F33]/72 to-[#0B1F33]/28" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07131F]/90 via-[#0B1F33]/25 to-[#07131F]/45" />

      {/* Soft yellow ambient accent */}
      <div
        className="absolute -left-20 top-1/3 w-[420px] h-[420px] rounded-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(245,197,24,0.18) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 40%, rgba(7,19,31,0.55) 100%)',
        }}
        aria-hidden
      />

      {/* Subtle film grain on hero only */}
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none hero-grain" aria-hidden />

      <motion.div style={{ opacity: contentOpacity }} className="relative z-10 container-page w-full pt-28 pb-16 sm:pb-20">
        <motion.div
          className="max-w-2xl"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-heading font-extrabold text-brand-yellow text-lg sm:text-xl tracking-tight mb-5">
            Camera 247 Huế
          </p>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
            Giải pháp công nghệ an ninh cho doanh nghiệp và hộ gia đình
          </h1>

          <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-[36ch] mb-8">
            Thi công camera, khóa thông minh và hệ thống mạng. Khảo sát tận nơi, bảo hành rõ ràng tại Huế.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a href="#lien-he" className="btn-accent group">
              Nhận tư vấn khảo sát
              <span className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
            <Link href="/cong-trinh" className="btn-ghost !border-white/25 !text-white hover:!bg-white/10">
              Xem công trình
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
