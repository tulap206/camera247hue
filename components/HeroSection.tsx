'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { SITE_IMAGES } from '@/lib/siteImages'

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-end overflow-hidden">
      <Image
        src={SITE_IMAGES.hero.src}
        alt={SITE_IMAGES.hero.alt}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07131F]/92 via-[#0B1F33]/75 to-[#0B1F33]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07131F]/85 via-transparent to-[#07131F]/30" />

      <div className="relative z-10 container-page w-full pt-28 pb-16 sm:pb-20">
        <Reveal className="max-w-2xl">
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
        </Reveal>
      </div>
    </section>
  )
}
