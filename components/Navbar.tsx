"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Shield, Phone } from 'lucide-react'

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] px-4 sm:px-6 lg:px-8 ${
        scrolled ? 'pt-4' : 'pt-6'
      }`}
    >
      {/* Fluid Island Navigation Container */}
      <div
        className={`mx-auto max-w-6xl rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? 'bg-[#0A0B0D]/80 border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl px-6 py-2.5'
            : 'bg-white/[0.02] border border-white/5 backdrop-blur-md px-8 py-3.5'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F5C518] to-[#C69B0B] rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-500 shadow-lg shadow-yellow-500/10">
              <Shield className="w-5 h-5 text-black" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-wider leading-tight font-heading">
                CAMERA 247
              </div>
              <div className="text-[#F5C518] text-[9px] tracking-widest uppercase font-medium">Huế Security</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors text-[11px] font-bold tracking-widest uppercase relative py-2 group/link"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-[#F5C518] rounded-full transition-all duration-300 group-hover/link:w-2" />
              </Link>
            ))}
          </nav>

          {/* Right Action Button (Button-in-Button / Nested Island) */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:0967611112"
              className="group flex items-center gap-2.5 bg-white text-black pl-4 pr-1.5 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase hover:bg-[#F5C518] active:scale-[0.97] transition-all duration-500"
            >
              <span>0967 611 112</span>
              <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                <Phone className="w-3.5 h-3.5 text-black" strokeWidth={2} />
              </div>
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-95"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Menu className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Floating Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-3 bg-[#0A0B0D]/95 border border-white/10 p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl animate-fade-in max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl text-xs font-bold tracking-widest uppercase transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-white/5 my-2" />
            <a
              href="tel:0967611112"
              className="group flex items-center justify-between bg-[#F5C518] text-black px-5 py-3 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all active:scale-[0.98]"
            >
              <span>Gọi: 0967 611 112</span>
              <Phone className="w-4 h-4 text-black" strokeWidth={2} />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
