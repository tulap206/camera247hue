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
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#F5C518] animate-pulse" />
              <span className="text-[#F5C518] text-sm font-medium">Camera 247 Huế — Giám Sát 24/7</span>
            </div>

            <h1 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              GIẢI PHÁP{' '}
              <span className="text-[#F5C518]" style={{ textShadow: '0 0 30px rgba(245,197,24,0.4)' }}>
                CÔNG NGHỆ
              </span>
              <br />AN NINH TOÀN DIỆN
            </h1>

            <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-lg">
              Thi công hệ thống camera an ninh, khóa cửa thông minh, mạng chuyên dụng — 
              bảo vệ tài sản và con người của bạn <strong className="text-[#F5C518]">24/7</strong>.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <a href="#lien-he"
                className="bg-[#F5C518] text-black px-8 py-3.5 rounded-full font-bold text-base hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/25">
                Tư Vấn Miễn Phí
              </a>
              <Link href="/cong-trinh"
                className="border border-[#F5C518]/50 text-[#F5C518] px-8 py-3.5 rounded-full font-semibold text-base hover:bg-[#F5C518]/10 transition-all">
                Xem Công Trình →
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: Shield, value: '500+', label: 'Công trình' },
                { icon: Eye, value: '24/7', label: 'Hỗ trợ' },
                { icon: Lock, value: '10+', label: 'Năm kinh nghiệm' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-[#F5C518]" />
                  <div>
                    <div className="text-white font-bold text-lg leading-tight"
                      style={{ fontFamily: 'Oswald, sans-serif' }}>{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Camera mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Camera surveillance card */}
              <div className="w-72 h-72 rounded-3xl bg-[#1E1E1E] border border-[#F5C518]/20 p-6 relative overflow-hidden shadow-2xl">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-mono">LIVE</span>
                  </div>
                  <span className="text-gray-500 text-xs font-mono">CAM-01</span>
                </div>

                {/* Grid screen */}
                <div className="grid grid-cols-2 gap-1 mb-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-video bg-[#111] rounded-md border border-gray-800 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30"
                        style={{
                          background: `linear-gradient(${i * 45}deg, #F5C518 0%, transparent 100%)`
                        }} />
                      <Eye className="w-4 h-4 text-[#F5C518]/40" />
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="text-[#F5C518] text-xs font-mono">CAMERA 247 HUẾ</div>
                  <div className="text-gray-600 text-xs">Giám sát toàn diện</div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 right-0 w-0 h-0"
                    style={{
                      borderLeft: '64px solid transparent',
                      borderTop: '64px solid rgba(245,197,24,0.2)'
                    }} />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-[#F5C518] text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ● ĐANG HOẠT ĐỘNG
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[#1E1E1E] border border-[#F5C518]/30 text-[#F5C518] text-xs font-mono px-3 py-1.5 rounded-full">
                HD 2MP | 4K | PTZ
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
