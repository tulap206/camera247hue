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
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const solid = scrolled || mobileOpen || !isHome

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div
        className={`transition-all duration-300 ease-out ${
          solid
            ? 'bg-white/90 border-b border-brand-border backdrop-blur-xl shadow-[0_8px_30px_rgba(15,35,55,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-[68px]">
            <Link href="/" className="flex items-center gap-3 min-w-0 group">
              <div className="w-10 h-10 rounded-xl bg-brand-yellow flex items-center justify-center shrink-0 group-hover:scale-[1.03] transition-transform duration-300 ease-out">
                <Shield className="w-5 h-5 text-brand-navy" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <div
                  className={`font-heading font-extrabold text-[17px] leading-none tracking-tight transition-colors ${
                    solid ? 'text-brand-navy' : 'text-white'
                  }`}
                >
                  Camera 247
                </div>
                <div className={`text-[11px] mt-0.5 ${solid ? 'text-brand-muted' : 'text-white/70'}`}>
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

            <button
              type="button"
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                solid ? 'text-brand-navy hover:bg-brand-soft' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-brand-border bg-white px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-brand-ink font-medium border-b border-brand-border/70 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:0967611112"
              className="mt-4 btn-accent w-full !text-sm"
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
