'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Shield, Phone, MapPin } from 'lucide-react'

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
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-panel shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="bg-[#F5C518] text-black text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <span className="font-semibold inline-flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" aria-hidden />
            Hotline:
            <a href="tel:0967611112" className="font-bold hover:underline">
              0967 611 112
            </a>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-black/80">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
            40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 bg-[#F5C518] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div
                className="font-bold text-[#F5C518] text-lg leading-tight truncate"
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                CAMERA 247
              </div>
              <div className="text-gray-500 text-xs leading-tight truncate">Giải Pháp An Ninh Huế</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-[#F5C518] transition-colors text-sm font-medium whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
            <a href="tel:0967611112" className="btn-primary px-5 py-2 rounded-xl text-sm whitespace-nowrap">
              Gọi Ngay
            </a>
          </nav>

          <button
            type="button"
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden glass-panel border-t border-white/5 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-gray-300 hover:text-[#F5C518] border-b border-white/5 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:0967611112"
            className="mt-4 block btn-primary py-3 rounded-xl text-center text-sm"
            onClick={() => setMobileOpen(false)}
          >
            Gọi Ngay: 0967 611 112
          </a>
        </div>
      )}
    </header>
  )
}
