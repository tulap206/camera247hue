'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, Shield, Eye, Lock, Phone, ArrowUpRight } from 'lucide-react'

export default function HeroSection() {
  const scanRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scanRef.current
    if (!el) return
    let pos = 0
    const interval = setInterval(() => {
      pos = (pos + 0.4) % 100
      el.style.top = `${pos}%`
    }, 16)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#050505] pt-36 lg:pt-44 pb-24">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(245,197,24,0.06),transparent_60%)] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left content (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Eyebrow capsule badge */}
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5C518]"></span>
              </span>
              <span className="text-zinc-300 text-[10px] tracking-[0.2em] font-extrabold uppercase">
                Huế Security Solutions
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              GIẢI PHÁP{' '}
              <span className="bg-gradient-to-r from-[#F5C518] to-[#DFB53B] bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(245,197,24,0.15)]">
                CÔNG NGHỆ
              </span>
              <br />BẢO AN TOÀN DIỆN
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
              Thiết kế, lắp đặt hệ thống giám sát camera thông minh, hạ tầng mạng doanh nghiệp 
              và giải pháp khóa vân tay bảo mật cao chuyên nghiệp tại Tp. Huế.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <a
                href="#lien-he"
                className="group flex items-center gap-3 bg-[#F5C518] text-black pl-6 pr-1.5 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase hover:bg-white transition-all duration-300 active:scale-[0.98]"
              >
                <span>Tư Vấn Miễn Phí</span>
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={2} />
                </div>
              </a>
              <Link
                href="/cong-trinh"
                className="text-zinc-400 hover:text-white px-7 py-3 rounded-full font-bold text-[10px] tracking-widest uppercase border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-[0.98]"
              >
                Xem Công Trình
              </Link>
            </div>

            {/* Quick stats list */}
            <div className="flex flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-white/5">
              {[
                { icon: Shield, value: '1,200+', label: 'Hệ thống an ninh' },
                { icon: Eye, value: '24/7/365', label: 'Giám sát vận hành' },
                { icon: Lock, value: '12+ Năm', label: 'Tích hợp hệ thống' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-4 h-4 text-[#F5C518]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-sm leading-none font-heading uppercase tracking-wide">
                      {stat.value}
                    </div>
                    <div className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-1">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right hardware mockup (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
            {/* Outer Bezel */}
            <div className="w-full max-w-sm bg-white/[0.02] border border-white/10 p-3.5 rounded-[2.5rem] shadow-2xl relative">
              
              {/* Inner Bezel Core */}
              <div className="bg-[#0A0B0D] border border-white/5 rounded-[calc(2.5rem-0.875rem)] p-5 relative overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                
                {/* Scanner line */}
                <div
                  ref={scanRef}
                  className="absolute left-0 right-0 h-[1.5px] pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.3), transparent)',
                    boxShadow: '0 0 8px rgba(245,197,24,0.2)',
                  }}
                />

                {/* Status indicator bar */}
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-400 text-[9px] font-mono tracking-widest uppercase font-bold">
                      SYSTEM SECURE
                    </span>
                  </div>
                  <span className="text-zinc-600 text-[9px] font-mono font-bold">LIVE_FEED_SYS</span>
                </div>

                {/* Simulated CCTV Camera Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'CAM_01_VÝ_DẠ', active: true },
                    { label: 'CAM_02_PHÚ_HỘI', active: false },
                    { label: 'CAM_03_AN_CỰU', active: false },
                    { label: 'CAM_04_HƯƠNG_THỦY', active: false },
                  ].map((cam, i) => (
                    <div
                      key={i}
                      className="aspect-video bg-black rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden group/screen cursor-pointer"
                    >
                      {/* Holographic overlay grid */}
                      <div className="absolute inset-0 opacity-10 group-hover/screen:opacity-20 transition-opacity bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01),rgba(255,255,255,0.02))] bg-[size:100%_4px,6px_100%]" />
                      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-yellow-500/10 via-transparent to-black" />
                      
                      <Eye className="w-4 h-4 text-zinc-600 group-hover/screen:scale-110 group-hover/screen:text-[#F5C518] transition-all duration-500" strokeWidth={1.5} />
                      <span className="absolute bottom-1.5 left-1.5 text-[7px] font-mono text-zinc-500 bg-black/60 px-1 rounded-sm tracking-wider uppercase font-semibold">
                        {cam.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid footnote */}
                <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600 border-t border-white/5 pt-3">
                  <span className="font-semibold uppercase tracking-wider">CAMERA 247 SYSTEM</span>
                  <span className="font-semibold">NODE: HUE_CCTV_NET</span>
                </div>
              </div>

              {/* Hardware floating accents */}
              <div className="absolute -top-3.5 -right-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-full shadow-lg tracking-wider uppercase">
                Active
              </div>
              <div className="absolute -bottom-3.5 -left-3.5 bg-[#0A0B0D] border border-white/10 text-zinc-400 text-[8px] font-mono px-3 py-1 rounded-full shadow-xl font-bold tracking-wider">
                H.265+ | 4K HDR
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator pill */}
      <a
        href="#dich-vu"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-zinc-500 hover:text-[#F5C518] transition-colors"
      >
        <span className="text-[9px] tracking-[0.2em] font-extrabold uppercase">Cuộn xuống</span>
        <ChevronDown className="w-4 h-4 animate-bounce" strokeWidth={1.5} />
      </a>
    </section>
  )
}
