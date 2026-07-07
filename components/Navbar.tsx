'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Shield } from 'lucide-react'

const navLinks = [
  { href: '#dich-vu', label: 'Dịch Vụ' },
  { href: '#tai-sao-chon-chung-toi', label: 'Về Chúng Tôi' },
  { href: '/cong-trinh', label: 'Công Trình' },
  { href: '#lien-he', label: 'Liên Hệ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-panel bg-brand-dark/80 shadow-2xl border-b border-white/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Top bar */}
      <div className="bg-[#F5C518] text-black text-xs py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center font-medium tracking-wide">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          Hotline: <a href="tel:0967611112" className="font-bold hover:underline">0967 611 112</a>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <span>📍 40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-[#F5C518] to-[#C69B0B] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/25">
              <Shield className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-extrabold text-[#F5C518] text-xl tracking-wider leading-tight font-heading">
                CAMERA 247
              </div>
              <div className="text-gray-400 text-[10px] tracking-widest uppercase font-medium">Huế Security Solutions</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-[#F5C518] transition-all text-xs font-semibold tracking-widest uppercase relative py-2 group/link"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F5C518] transition-all duration-300 group-hover/link:w-full" />
              </Link>
            ))}
            <a
              href="tel:0967611112"
              className="bg-gradient-to-r from-[#F5C518] to-[#C69B0B] text-black px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Liên Hệ Ngay
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 py-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2.5 px-4 text-gray-300 hover:text-[#F5C518] hover:bg-white/5 rounded-xl text-sm font-medium tracking-wide transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:0967611112"
              className="mt-2 block bg-gradient-to-r from-[#F5C518] to-[#C69B0B] text-black py-3 rounded-xl font-bold text-center text-sm shadow-lg shadow-yellow-500/20"
            >
              📞 Gọi: 0967 611 112
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
