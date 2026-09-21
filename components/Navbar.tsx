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
    const { body, documentElement } = document
    if (mobileOpen) {
      body.style.overflow = 'hidden'
    } else {
      body.style.overflow = ''
      documentElement.style.overflow = ''
    }
    return () => {
      body.style.overflow = ''
      documentElement.style.overflow = ''
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
                <div className={`text-[10px] sm:text-[11px] mt-0.5 max-w-[210px] sm:max-w-none truncate ${solid ? 'text-brand-muted' : 'text-white/75'}`}>
                  Công ty TNHH Công Nghệ An Ninh Huế - Camera247 Huế
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
              {pathname !== '/login' && pathname !== '/admin' && (
                <Link
                  href="/login"
                  className={`text-sm font-semibold rounded-full px-4 py-2 border min-h-[40px] inline-flex items-center transition-colors ${
                    solid
                      ? 'border-brand-border text-brand-navy hover:bg-brand-soft'
                      : 'border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  Đăng nhập
                </Link>
              )}
              <a
                href="tel:0796785151"
                className="btn-accent !py-2.5 !px-5 !text-sm inline-flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                0796 785 151
              </a>
            </nav>

            <div className="flex items-center gap-1.5 lg:hidden">
              <a
                href="tel:0796785151"
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  solid ? 'bg-brand-yellow text-brand-navy' : 'bg-white/15 text-white'
                }`}
                aria-label="Gọi 0796 785 151"
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
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] sm:top-[calc(68px+env(safe-area-inset-top))] z-40 bg-white/98 backdrop-blur-2xl overflow-y-auto px-5 py-4 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col justify-between shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between py-3.5 text-brand-navy font-bold border-b border-brand-border/60 text-[15px] active:text-brand-yellow-dark"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-brand-muted font-normal">→</span>
                </Link>
              ))}
              {pathname !== '/login' && pathname !== '/admin' && (
                <Link
                  href="/login"
                  className="flex items-center justify-between py-3.5 text-brand-navy font-bold border-b border-brand-border/60 text-[15px]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>Đăng nhập Admin</span>
                  <span className="text-xs text-brand-muted font-normal">→</span>
                </Link>
              )}
            </div>

            <div className="pt-6 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-2">
                Hotline kỹ thuật tại TP. Huế:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:0796785151"
                  className="btn-accent w-full !py-2.5 !text-xs text-center flex items-center justify-center gap-1.5"
                  onClick={() => setMobileOpen(false)}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>0796 785 151 (Tước)</span>
                </a>
                <a
                  href="tel:0967611112"
                  className="btn-ghost w-full !py-2.5 !text-xs text-center flex items-center justify-center gap-1.5 !bg-brand-soft"
                  onClick={() => setMobileOpen(false)}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>0967 611 112 (Lập)</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
