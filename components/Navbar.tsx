"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Shield, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#dich-vu", label: "Dịch vụ" },
  { href: "#tai-sao-chon-chung-toi", label: "Về chúng tôi" },
  { href: "/cong-trinh", label: "Công trình" },
  { href: "#lien-he", label: "Liên hệ" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[#070708]/90 shadow-2xl backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-[#F5C518] text-xs font-medium text-black transition-all duration-300",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <a href="tel:0967611112" className="inline-flex items-center gap-1.5 hover:underline">
            <Phone className="size-3.5" />
            Hotline: <strong>0967 611 112</strong>
          </a>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <MapPin className="size-3.5" />
            40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className={cn("flex w-full items-center justify-between transition-all", scrolled ? "h-16" : "h-18 py-3")}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5C518] shadow-lg shadow-yellow-500/20 sm:size-11">
              <Shield className="size-5 text-black sm:size-6" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="font-heading text-lg font-bold tracking-wide text-[#F5C518]">CAMERA 247</p>
              <p className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
                Huế Security
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-[#F5C518]"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:0967611112"
              className="rounded-xl bg-[#F5C518] px-5 py-2.5 text-xs font-bold tracking-wide text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Liên hệ ngay
            </a>
          </nav>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#070708]/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-[#F5C518]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:0967611112"
              className="mt-2 rounded-xl bg-[#F5C518] py-3 text-center text-sm font-bold text-black"
            >
              Gọi: 0967 611 112
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
