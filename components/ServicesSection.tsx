"use client"

import { Camera, Wifi, Lock, Bell, Monitor, Cpu, ArrowRight } from "lucide-react"
import { BlurFade } from "@/components/magicui/blur-fade"

const featured = {
  icon: Camera,
  title: "Camera an ninh",
  description:
    "Thi công hệ thống camera giám sát chuyên nghiệp — HD/4K, thương hiệu Hikvision, Dahua, Panasonic. Xem từ xa qua app.",
  features: ["Camera IP & Analog", "Độ phân giải 2–8MP", "Hồng ngoại ban đêm", "Xem từ xa qua app"],
}

const others = [
  {
    icon: Lock,
    title: "Khóa cửa thông minh",
    description: "Vân tay, thẻ từ, mật mã, điều khiển từ xa qua wifi.",
  },
  {
    icon: Wifi,
    title: "Hệ thống mạng",
    description: "Wifi phủ sóng, switch/router, cabling Cat6 cho cafe & văn phòng.",
  },
  {
    icon: Bell,
    title: "Báo trộm & định vị",
    description: "Cảm biến chuyển động, báo động điện thoại, GPS xe.",
  },
  {
    icon: Monitor,
    title: "Máy chấm công",
    description: "Vân tay / thẻ từ, phần mềm quản lý, cổng từ siêu thị.",
  },
  {
    icon: Cpu,
    title: "Máy tính & thiết bị",
    description: "Sửa laptop/PC, máy in, linh kiện mạng — tận nơi tại Huế.",
  },
]

export default function ServicesSection() {
  return (
    <section id="dich-vu" className="scroll-mt-24 bg-[#0d0d0d] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <BlurFade inView direction="up" offset={14}>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-[#F5C518]">Dịch vụ</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
              Giải pháp an ninh toàn diện
            </h2>
            <p className="mt-3 max-w-[55ch] text-base leading-relaxed text-zinc-400">
              Từ lắp đặt camera, khóa thông minh đến hạ tầng mạng — một địa chỉ cho mọi nhu cầu an
              ninh tại Huế.
            </p>
          </div>
        </BlurFade>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
          <BlurFade inView delay={0.05} direction="up" className="lg:col-span-7 lg:row-span-2">
            <article className="relative flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111115] p-8 sm:p-10">
              <div className="absolute -right-16 -bottom-20 size-64 rounded-full bg-[#F5C518]/10 blur-3xl" />
              <div className="relative">
                <featured.icon className="size-8 text-[#F5C518]" />
                <p className="mt-4 text-xs font-semibold tracking-wide text-[#F5C518]">Phổ biến nhất</p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-white">{featured.title}</h3>
                <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-zinc-400">
                  {featured.description}
                </p>
                <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {featured.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="size-1.5 rounded-full bg-[#F5C518]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#lien-he"
                className="relative mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F5C518] hover:text-[#FCDD60]"
              >
                Nhận tư vấn
                <ArrowRight className="size-4" />
              </a>
            </article>
          </BlurFade>

          {others.map((service, i) => {
            const Icon = service.icon
            return (
              <BlurFade
                key={service.title}
                inView
                delay={0.08 + i * 0.04}
                direction="up"
                className="lg:col-span-5"
              >
                <article className="h-full rounded-2xl border border-white/5 bg-[#111115] p-6 transition-colors hover:border-[#F5C518]/25">
                  <Icon className="size-6 text-[#F5C518]" />
                  <h3 className="mt-3 font-heading text-lg font-bold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{service.description}</p>
                </article>
              </BlurFade>
            )
          })}
        </div>
      </div>
    </section>
  )
}
