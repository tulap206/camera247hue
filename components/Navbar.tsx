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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#111111]/95 backdrop-blur-md shadow-lg shadow-yellow-500/10' : 'bg-transparent'
      }`}
    >
      {/* Top bar */}
      <div className="bg-[#F5C518] text-black text-xs py-1.5 px-4 flex justify-between items-center">
        <span className="font-semibold">📞 Hotline: <a href="tel:0967611112" className="font-bold">0967 611 112</a></span>
        <span className="hidden sm:block">📍 40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#F5C518] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-[#F5C518] text-lg leading-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
                CAMERA 247
              </div>
              <div className="text-gray-400 text-xs leading-tight">Giải Pháp An Ninh Huế</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-[#F5C518] transition-colors text-sm font-medium tracking-wide uppercase"
                style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:0967611112"
              className="bg-[#F5C518] text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95"
            >
              Gọi Ngay
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1A1A1A] border-t border-[#F5C518]/20 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-gray-300 hover:text-[#F5C518] border-b border-gray-800 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:0967611112"
            className="mt-4 block bg-[#F5C518] text-black py-3 rounded-full font-bold text-center"
          >
            📞 Gọi Ngay: 0967 611 112
          </a>
        </div>
      )}
    </header>
  )
}
