'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Shield, Phone } from 'lucide-react'

const navLinks = [
  { href: '/#dich-vu', label: 'Dịch vụ' },
  { href: '/#quy-trinh', label: 'Quy trình' },
  { href: '/cong-trinh', label: 'Công trình' },
  { href: '/#lien-he', label: 'Liên hệ' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(!isHome)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isHome) {
      setScrolled(true)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const solid = scrolled || mobileOpen || !isHome

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
      <div
        className={`transition-all duration-300 ease-out ${
          solid
            ? 'bg-white/92 border-b border-brand-border backdrop-blur-xl shadow-[0_8px_30px_rgba(15,35,55,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-14 sm:h-[68px]">
            <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-yellow flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-brand-navy" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <div
                  className={`font-heading font-extrabold text-[16px] sm:text-[17px] leading-none tracking-tight transition-colors ${
                    solid ? 'text-brand-navy' : 'text-white'
                  }`}
                >
                  Camera 247
                </div>
                <div className={`text-[10px] sm:text-[11px] mt-0.5 truncate ${solid ? 'text-brand-muted' : 'text-white/70'}`}>
                  Giải pháp an ninh Huế
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    solid ? 'text-brand-ink/80 hover:text-brand-navy' : 'text-white/85 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="tel:0967611112"
                className="btn-accent !py-2.5 !px-5 !text-sm inline-flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                0967 611 112
              </a>
            </nav>

            <div className="flex items-center gap-1.5 lg:hidden">
              <a
                href="tel:0967611112"
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  solid ? 'bg-brand-yellow text-brand-navy' : 'bg-white/15 text-white'
                }`}
                aria-label="Gọi 0967 611 112"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                type="button"
                className={`w-11 h-11 flex items-center justify-center rounded-xl ${
                  solid ? 'text-brand-navy' : 'text-white'
                }`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-40 bg-white overflow-y-auto px-5 py-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-4 text-brand-ink font-medium border-b border-brand-border/70 text-base"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:0967611112"
              className="mt-6 btn-accent w-full"
              onClick={() => setMobileOpen(false)}
            >
              Gọi 0967 611 112
            </a>
          </div>
        )}
      </div>
    </header>
  )
}
