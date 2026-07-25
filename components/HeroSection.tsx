"use client"

import Link from "next/link"
import { ChevronDown, Shield, Eye, Lock, Phone } from "lucide-react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BorderBeam } from "@/components/magicui/border-beam"
import { NumberTicker } from "@/components/magicui/number-ticker"

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[100dvh] items-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(125deg,#070708_0%,#111111_45%,#1a1400_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#F5C518 1px, transparent 1px), linear-gradient(90deg, #F5C518 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,197,24,0.12),transparent_55%)]" />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#F5C518]/80" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-14 lg:px-8 lg:pt-32">
        <div className="space-y-7 lg:col-span-7">
          <BlurFade delay={0.05} direction="up" offset={12}>
            <p className="text-sm font-semibold tracking-[0.18em] text-[#F5C518]/90 uppercase">
              Camera 247 Huế
            </p>
          </BlurFade>

          <BlurFade delay={0.12} direction="up" offset={16}>
            <h1 className="max-w-[16ch] font-heading text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
              Giải pháp{" "}
              <AnimatedGradientText
                colorFrom="#F5C518"
                colorTo="#FCDD60"
                speed={0.85}
                className="font-heading font-bold"
              >
                công nghệ an ninh
              </AnimatedGradientText>{" "}
              toàn diện
            </h1>
          </BlurFade>

          <BlurFade delay={0.2} direction="up" offset={14}>
            <p className="max-w-[46ch] text-base leading-relaxed text-zinc-400 sm:text-lg">
              Tư vấn, thiết kế và thi công trọn gói camera giám sát, khóa cửa thông minh và hạ tầng
              mạng cho hộ gia đình, cafe, khách sạn và doanh nghiệp tại Huế.
            </p>
          </BlurFade>

          <BlurFade delay={0.28} direction="up" offset={12}>
            <div className="flex flex-wrap items-center gap-3">
              <ShimmerButton
                type="button"
                background="rgb(245 197 24)"
                shimmerColor="#ffffff"
                borderRadius="14px"
                className="h-12 px-7 text-sm font-bold text-black shadow-lg shadow-yellow-500/20"
                onClick={() => {
                  document.getElementById("lien-he")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Tư vấn miễn phí
              </ShimmerButton>
              <Link
                href="/cong-trinh"
                className="inline-flex h-12 items-center rounded-[14px] border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:border-[#F5C518]/40 hover:text-[#F5C518]"
              >
                Xem công trình
              </Link>
              <a
                href="tel:0967611112"
                className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-white/10 px-5 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
              >
                <Phone className="size-4 text-[#F5C518]" />
                0967 611 112
              </a>
            </div>
          </BlurFade>

          <BlurFade delay={0.36} direction="up" offset={10}>
            <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6">
              <div>
                <div className="flex items-baseline gap-0.5">
                  <NumberTicker value={1200} className="font-heading text-2xl font-bold text-white" />
                  <span className="text-sm text-zinc-400">+</span>
                </div>
                <p className="text-xs text-zinc-500">công trình</p>
              </div>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <NumberTicker value={12} className="font-heading text-2xl font-bold text-white" />
                  <span className="text-sm text-zinc-400">+</span>
                </div>
                <p className="text-xs text-zinc-500">năm kinh nghiệm</p>
              </div>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <NumberTicker value={24} className="font-heading text-2xl font-bold text-white" />
                  <span className="text-sm text-zinc-400">/7</span>
                </div>
                <p className="text-xs text-zinc-500">hỗ trợ kỹ thuật</p>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.4} direction="up" offset={8}>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="size-3.5 text-[#F5C518]" />
                Hikvision · Dahua · Panasonic
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-3.5 text-[#F5C518]" />
                Camera 4K · xem từ xa
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5 text-[#F5C518]" />
                Khóa vân tay thông minh
              </span>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.22} direction="up" offset={20} className="hidden lg:col-span-5 lg:block">
          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12]/90 p-6 shadow-2xl">
            <BorderBeam size={100} duration={8} borderWidth={1.5} colorFrom="#F5C518" colorTo="#FCDD60" />

            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[10px] tracking-widest text-emerald-400 uppercase">
                  Live monitoring
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">NODE_CAM_01</span>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-black/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F5C518]/20 via-transparent to-black/60" />
                  <Eye className="relative size-5 text-[#F5C518]/70" />
                  <span className="absolute right-1.5 bottom-1 rounded bg-black/50 px-1 font-mono text-[8px] text-zinc-500">
                    CH-0{i}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 text-center">
              <p className="font-heading text-xs font-bold tracking-widest text-[#F5C518] uppercase">
                Camera 247 System
              </p>
              <p className="mt-0.5 text-[10px] tracking-wide text-zinc-500 uppercase">
                Huế · 4K · PoE · H.265+
              </p>
            </div>
          </div>
        </BlurFade>
      </div>

      <a
        href="#dich-vu"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 transition-colors hover:text-[#F5C518]"
      >
        <span className="text-xs tracking-widest uppercase">Khám phá</span>
        <ChevronDown className="size-5 animate-bounce" />
      </a>
    </section>
  )
}
