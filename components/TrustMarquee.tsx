"use client"

import { CheckCircle } from "lucide-react"
import { Marquee } from "@/components/magicui/marquee"

const ITEMS = [
  "Camera Hikvision · Dahua · Panasonic",
  "Thi công trọn gói tại Huế",
  "Hỗ trợ kỹ thuật 24/7",
  "Khóa cửa thông minh",
  "Hạ tầng mạng chuyên dụng",
  "Bảo hành 12–24 tháng",
  "Hơn 1200 công trình",
]

export default function TrustMarquee() {
  return (
    <section className="border-y border-white/5 bg-[#0a0a0a] py-3" aria-label="Cam kết">
      <Marquee pauseOnHover className="[--duration:38s] [--gap:2.5rem]">
        {ITEMS.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400"
          >
            <CheckCircle className="size-4 text-[#F5C518]" />
            {item}
          </span>
        ))}
      </Marquee>
    </section>
  )
}
