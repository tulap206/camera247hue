"use client"

import { useState } from "react"
import { Phone, MapPin, Facebook, Clock, Send, CheckCircle } from "lucide-react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"

const services = [
  "Camera An Ninh",
  "Khóa Cửa Thông Minh",
  "Hệ Thống Mạng",
  "Báo Trộm & Định Vị",
  "Máy Chấm Công",
  "Máy Tính & Thiết Bị",
  "Khác",
]

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      setError("Vui lòng nhập họ tên và số điện thoại.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setLoading(false)
      if (res.ok) {
        setSuccess(true)
        setForm({ name: "", phone: "", email: "", service: "", message: "" })
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.")
      }
    } catch {
      setLoading(false)
      setError("Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.")
    }
  }

  return (
    <section id="lien-he" className="scroll-mt-24 bg-[#070708] py-20 sm:py-24 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 size-[500px] rounded-full bg-[#F5C518]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <BlurFade inView direction="up">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-[#F5C518]">Liên hệ</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tư vấn miễn phí — báo giá nhanh
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Đội ngũ kỹ thuật sẵn sàng tư vấn giải pháp tối ưu cho nhu cầu an ninh và mạng của bạn.
            </p>
          </div>
        </BlurFade>

        <div className="grid gap-10 lg:grid-cols-2">
          <BlurFade inView delay={0.05} direction="up">
            <div className="space-y-4">
              {[
                {
                  icon: Phone,
                  title: "Điện thoại / Zalo",
                  lines: ["0967 611 112", "0777 611 112"],
                  action: "tel:0967611112",
                },
                {
                  icon: MapPin,
                  title: "Địa chỉ",
                  lines: ["40 Tùng Thiện Vương", "Phường Vỹ Dạ, Tp. Huế"],
                  action: "https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế",
                },
                {
                  icon: Facebook,
                  title: "Facebook",
                  lines: ["facebook.com/Camera247Hue"],
                  action: "https://facebook.com/Camera247Hue",
                },
                {
                  icon: Clock,
                  title: "Giờ làm việc",
                  lines: ["Thứ 2 – Thứ 7: 7:30 – 18:00", "Chủ Nhật: 8:00 – 12:00"],
                  action: null as string | null,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-[#111115] p-4"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <item.icon className="size-5 text-[#F5C518]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                      {item.title}
                    </p>
                    {item.lines.map((line) =>
                      item.action ? (
                        <a
                          key={line}
                          href={item.action}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-bold text-white hover:text-[#F5C518]"
                        >
                          {line}
                        </a>
                      ) : (
                        <p key={line} className="text-sm font-bold text-white">
                          {line}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}

              <div className="h-56 overflow-hidden rounded-2xl border border-white/5 sm:h-64">
                <iframe
                  src="https://maps.google.com/maps?q=40%20T%C3%B9ng%20Thi%E1%BB%87n%20V%C6%B0%C6%A1ng%2C%20V%E1%BB%B9%20D%E1%BA%A1%2C%20Th%C3%A0nh%20ph%E1%BB%91%20Hu%E1%BA%BF&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(120%)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ Camera 247 Huế"
                />
              </div>
            </div>
          </BlurFade>

          <BlurFade inView delay={0.1} direction="up">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111115] p-6 sm:p-8">
              <BorderBeam size={110} duration={10} colorFrom="#F5C518" colorTo="#FCDD60" />
              <h3 className="font-heading text-xl font-bold text-white">Gửi yêu cầu tư vấn</h3>

              {success ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <CheckCircle className="mb-4 size-14 text-emerald-400" />
                  <h4 className="text-xl font-bold text-white">Đã gửi thành công</h4>
                  <p className="mt-2 text-sm text-zinc-400">
                    Cảm ơn bạn. Chúng tôi sẽ gọi lại trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm font-semibold text-[#F5C518] hover:underline"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518]"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518]"
                        placeholder="0967 611 112"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518]"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Dịch vụ cần tư vấn
                    </label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-[#111115] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-[#F5C518]"
                    >
                      <option value="">— Chọn dịch vụ —</option>
                      {services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Nội dung</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518]"
                      placeholder="Mô tả nhu cầu của bạn…"
                    />
                  </div>

                  {error ? <p className="text-xs font-medium text-rose-400">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F5C518] text-sm font-bold text-black transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Đang gửi…
                      </span>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Gửi yêu cầu tư vấn
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
