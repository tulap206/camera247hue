'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, Shield, Eye, Lock } from 'lucide-react'

export default function HeroSection() {
  const scanRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scan line animation
    const el = scanRef.current
    if (!el) return
    let pos = 0
    const interval = setInterval(() => {
      pos = (pos + 0.5) % 100
      el.style.top = `${pos}%`
    }, 16)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1200]" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#F5C518 1px, transparent 1px), linear-gradient(90deg, #F5C518 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Scan line effect */}
      <div ref={scanRef} className="absolute left-0 right-0 h-[2px] pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.4), transparent)',
          boxShadow: '0 0 10px rgba(245,197,24,0.3)',
        }}
      />

      {/* Circle decorations */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] rounded-full border border-[#F5C518]/10" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] rounded-full border border-[#F5C518]/15" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[200px] h-[200px] rounded-full bg-[#F5C518]/5" />

      {/* Hazard stripe top */}
      <div className="absolute top-0 left-0 right-0 h-2 hazard-stripe opacity-80" />
      {/* Hazard stripe bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2 hazard-stripe opacity-80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 rounded-full px-4 py-2 shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
              </span>
              <span className="text-gray-300 text-xs tracking-wider font-semibold uppercase">Hệ thống an ninh chuyên nghiệp tại Huế</span>
            </div>

            <h1 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-none tracking-tight">
              GIẢI PHÁP{' '}
              <span className="bg-gradient-to-r from-[#F5C518] to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,197,24,0.3)]">
                CÔNG NGHỆ
              </span>
              <br />AN NINH TOÀN DIỆN
            </h1>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Chuyên tư vấn, thiết kế và thi công trọn gói hệ thống camera giám sát thông minh, 
              khóa cửa vân tay bảo mật cao và hạ tầng mạng chuyên dụng cho doanh nghiệp, hộ gia đình.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#lien-he"
                className="bg-gradient-to-r from-[#F5C518] to-amber-500 text-black px-8 py-4 rounded-full font-bold text-sm tracking-wider uppercase shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/45 hover:scale-105 active:scale-95 transition-all duration-300">
                Tư Vấn Miễn Phí
              </a>
              <Link href="/cong-trinh"
                className="glass-panel text-white hover:text-[#F5C518] px-8 py-4 rounded-full font-semibold text-sm tracking-wider uppercase hover:bg-white/5 border border-white/10 hover:border-yellow-500/40 transition-all duration-300">
                Xem Công Trình
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-white/5">
              {[
                { icon: Shield, value: '1200+', label: 'Công trình' },
                { icon: Eye, value: '24/7', label: 'Hỗ trợ' },
                { icon: Lock, value: '12+', label: 'Năm kinh nghiệm' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <stat.icon className="w-5 h-5 text-[#F5C518]" />
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-lg leading-none font-heading">{stat.value}</div>
                    <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Camera mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Outer glowing border card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-[32px] blur-xl opacity-75" />
              
              {/* Camera surveillance card */}
              <div className="w-80 glass-panel rounded-[28px] p-6 relative overflow-hidden shadow-2xl border border-white/10">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 text-[10px] font-mono tracking-widest uppercase">REC ACTIVE</span>
                  </div>
                  <span className="text-gray-500 text-[10px] font-mono">NODE_CAM_01</span>
                </div>

                {/* Grid screen */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-video bg-black/80 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group/screen cursor-pointer">
                      {/* Holographic overlay */}
                      <div className="absolute inset-0 opacity-10 group-hover/screen:opacity-20 transition-opacity bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />
                      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-yellow-500/40 via-transparent to-black" />
                      <Eye className="w-5 h-5 text-[#F5C518]/60 group-hover/screen:scale-110 group-hover/screen:text-[#F5C518] transition-all duration-300" />
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-gray-500 bg-black/40 px-1 rounded">CH-0{i}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2 border-t border-white/5">
                  <div className="text-[#F5C518] text-xs font-bold tracking-widest font-heading uppercase">CAMERA 247 SYSTEM</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mt-0.5">Huế City CCTV Live Feed</div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-0 h-0"
                    style={{
                      borderLeft: '64px solid transparent',
                      borderTop: '64px solid rgba(245,197,24,0.15)'
                    }} />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-full shadow-lg tracking-wider uppercase">
                Online
              </div>
              <div className="absolute -bottom-4 -left-4 glass-panel border border-white/10 text-[#F5C518] text-[9px] font-mono px-3.5 py-1.5 rounded-full shadow-xl">
                4K UHD | POE | H.265+
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#dich-vu"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 hover:text-[#F5C518] transition-colors">
        <span className="text-xs tracking-widest uppercase">Khám phá</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </a>
    </section>
  )
}
