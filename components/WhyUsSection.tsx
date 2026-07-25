"use client"

import {
  Award,
  Clock,
  Headphones,
  ThumbsUp,
  Users,
  Wrench,
  MapPin,
  Phone,
  Globe,
  Facebook,
} from "lucide-react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"

const reasons = [
  {
    icon: Award,
    title: "Thương hiệu hàng đầu",
    desc: "Hikvision, Dahua, Panasonic, Unifi — bảo hành đầy đủ từ nhà sản xuất.",
  },
  {
    icon: Clock,
    title: "Giám sát 24/7",
    desc: "Hỗ trợ kỹ thuật liên tục. Xử lý sự cố nhanh trong vòng 2 giờ tại Huế.",
  },
  {
    icon: Headphones,
    title: "Tư vấn tận tình",
    desc: "Giải pháp phù hợp ngân sách và nhu cầu thực tế của từng công trình.",
  },
  {
    icon: ThumbsUp,
    title: "Thi công chuyên nghiệp",
    desc: "Đi dây âm/nổi theo yêu cầu, thẩm mỹ cao, bàn giao đúng tiến độ.",
  },
  {
    icon: Users,
    title: "Hơn 1200 khách hàng",
    desc: "Hộ gia đình, cafe, khách sạn, trường học và doanh nghiệp tại Huế.",
  },
  {
    icon: Wrench,
    title: "Bảo hành trọn gói",
    desc: "Thiết bị 12–24 tháng, bảo trì định kỳ miễn phí trong thời hạn hợp đồng.",
  },
]

export default function WhyUsSection() {
  return (
    <section
      id="tai-sao-chon-chung-toi"
      className="scroll-mt-24 bg-[#070708] py-20 sm:py-24 relative overflow-hidden"
    >
      <div className="absolute top-1/4 left-0 size-[420px] rounded-full bg-[#F5C518]/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <BlurFade inView direction="up">
              <p className="text-sm font-semibold tracking-wide text-[#F5C518]">Vì sao chọn chúng tôi</p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
                Đối tác an ninh tin cậy tại Huế
              </h2>
              <p className="mt-3 text-base leading-relaxed text-zinc-400">
                Hơn 12 năm kinh nghiệm hạ tầng mạng và tích hợp hệ thống an ninh — đồng hành cùng hộ
                gia đình, biệt thự, cafe, nhà hàng, khách sạn và doanh nghiệp tại cố đô.
              </p>
            </BlurFade>

            <BlurFade inView delay={0.1} direction="up">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111115] p-6">
                <BorderBeam size={90} duration={9} colorFrom="#F5C518" colorTo="#C69B0B" />
                <p className="font-heading text-sm font-bold tracking-wide text-[#F5C518]">
                  Công ty TNHH Giải Pháp Công Nghệ An Ninh Camera 247 Huế
                </p>
                <div className="mt-4 space-y-2.5 text-sm text-zinc-400">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#F5C518]" />
                    40 Tùng Thiện Vương, Phường Vỹ Dạ, Tp. Huế
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 size-4 shrink-0 text-[#F5C518]" />
                    0967 611 112 — 0777 611 112
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Globe className="mt-0.5 size-4 shrink-0 text-[#F5C518]" />
                    camera247hue.com
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Facebook className="mt-0.5 size-4 shrink-0 text-[#F5C518]" />
                    facebook.com/Camera247Hue
                  </p>
                </div>
              </div>
            </BlurFade>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <BlurFade key={r.title} inView delay={0.05 * i} direction="up">
                <div className="h-full rounded-2xl border border-white/5 bg-[#111115] p-5 transition-colors hover:border-[#F5C518]/25">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <r.icon className="size-5 text-[#F5C518]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{r.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{r.desc}</p>
                    </div>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
