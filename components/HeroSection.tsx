'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Shield, Eye, Lock } from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#161008]" />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#F5C518 1px, transparent 1px), linear-gradient(90deg, #F5C518 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div
        className="scan-line absolute left-0 right-0 h-px pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.35), transparent)',
          boxShadow: '0 0 12px rgba(245,197,24,0.25)',
        }}
      />

      <div className="absolute top-1/2 right-[-8%] -translate-y-1/2 w-[min(520px,70vw)] aspect-square rounded-full border border-[#F5C518]/10" />
      <div className="absolute top-1/2 right-[-4%] -translate-y-1/2 w-[min(360px,50vw)] aspect-square rounded-full border border-[#F5C518]/15" />

      <div className="absolute top-0 left-0 right-0 h-1.5 hazard-stripe opacity-70" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]" aria-hidden />
              <span className="text-[#F5C518] text-sm font-medium">Giám sát 24/7 tại Huế</span>
            </div>

            <h1
              style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-white leading-[1.05] tracking-tight mb-4 text-balance"
            >
              GIẢI PHÁP{' '}
              <span className="text-[#F5C518]">CÔNG NGHỆ</span>
              <br />
              AN NINH TOÀN DIỆN
            </h1>

            <p className="text-gray-400 text-base sm:text-lg mb-7 leading-relaxed max-w-[34ch]">
              Camera, khóa thông minh và hệ thống mạng chuyên dụng. Bảo vệ tài sản của bạn mọi lúc.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#lien-he" className="btn-primary px-7 py-3 rounded-xl text-sm sm:text-base">
                Tư Vấn Miễn Phí
              </a>
              <Link href="/cong-trinh" className="btn-ghost px-7 py-3 rounded-xl text-sm sm:text-base">
                Xem Công Trình
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="hidden lg:block">
            <div className="relative ml-auto max-w-md">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
                <Image
                  src="https://picsum.photos/seed/camera247hue-security/800/1000"
                  alt="Hệ thống camera an ninh chuyên nghiệp tại Huế"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 0vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between glass-panel rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden />
                    <span className="text-emerald-400 text-xs font-mono">LIVE</span>
                  </div>
                  <span className="text-gray-500 text-xs font-mono">CAM-247</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { icon: Shield, label: '1200+' },
                      { icon: Eye, label: '24/7' },
                      { icon: Lock, label: '12+' },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <item.icon className="w-4 h-4 text-[#F5C518] mx-auto mb-1" />
                        <div
                          className="text-white font-bold text-sm font-tabular"
                          style={{ fontFamily: 'Oswald, sans-serif' }}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[#F5C518] text-xs font-mono text-center">CAMERA 247 HUẾ</p>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 bg-[#F5C518] text-black text-[11px] font-bold px-3 py-1 rounded-lg shadow-lg">
                ĐANG HOẠT ĐỘNG
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
