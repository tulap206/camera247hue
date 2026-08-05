'use client'

import { useState } from 'react'
import { Phone, MapPin, Facebook, Clock, Send, CheckCircle } from 'lucide-react'

const services = [
  'Camera An Ninh',
  'Khóa Cửa Thông Minh',
  'Hệ Thống Mạng',
  'Báo Trộm & Định Vị',
  'Máy Chấm Công',
  'Máy Tính & Thiết Bị',
  'Khác',
]

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      setError('Vui lòng nhập họ tên và số điện thoại.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setLoading(false)
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', phone: '', email: '', service: '', message: '' })
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.')
      }
    } catch {
      setLoading(false)
      setError('Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.')
    }
  }

  return (
    <section id="lien-he" className="scroll-mt-24 bg-[#050505] py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#F5C518]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]"></span>
            <span className="text-zinc-400 text-[10px] tracking-[0.2em] font-extrabold uppercase">Liên Hệ</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white leading-none tracking-tight">
            TƯ VẤN MIỄN PHÍ — BÁO GIÁ NHANH
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-[50ch] font-medium">
            Đội ngũ kỹ thuật chuyên nghiệp luôn sẵn sàng hỗ trợ khảo sát tận nhà và tư vấn giải pháp tối ưu cho công trình của bạn.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {[
              {
                icon: Phone,
                title: 'Hotline / Zalo',
                lines: ['0967 611 112', '0777 611 112'],
                action: 'tel:0967611112',
              },
              {
                icon: MapPin,
                title: 'Địa chỉ',
                lines: ['40 Tùng Thiện Vương', 'Phường Vỹ Dạ, Tp. Huế'],
                action: 'https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế',
              },
              {
                icon: Facebook,
                title: 'Facebook Page',
                lines: ['facebook.com/Camera247Hue'],
                action: 'https://facebook.com/Camera247Hue',
              },
              {
                icon: Clock,
                title: 'Thời gian làm việc',
                lines: ['Thứ 2 – Thứ 7: 7:30 – 18:00', 'Chủ Nhật: 8:00 – 12:00'],
                action: null,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-white/5 bg-[#0D0E10] p-5 shadow-sm"
              >
                <div className="flex w-9 h-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/10">
                  <item.icon className="w-4 h-4 text-[#F5C518]" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                    {item.title}
                  </p>
                  {item.lines.map((line) =>
                    item.action ? (
                      <a
                        key={line}
                        href={item.action}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm font-extrabold text-white hover:text-[#F5C518] transition-colors"
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={line} className="text-sm font-extrabold text-white">
                        {line}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}

            {/* Dark map frame wrapper */}
            <div className="h-60 overflow-hidden rounded-2xl border border-white/5 shadow-inner">
              <iframe
                src="https://maps.google.com/maps?q=40%20T%C3%B9ng%20Thi%E1%BB%87n%20V%C6%B0%C6%A1ng%2C%20V%E1%BB%B9%20D%E1%BA%A1%2C%20Th%C3%A0nh%20ph%E1%BB%91%20Hu%E1%BA%BF&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(120%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Camera 247 Huế"
              />
            </div>
          </div>

          {/* Right Form (7 cols) */}
          <div className="lg:col-span-7 p-1.5 bg-white/[0.02] border border-white/10 rounded-[2.2rem] shadow-2xl relative">
            <div className="bg-[#0D0E10] border border-white/5 rounded-[calc(2.2rem-0.375rem)] p-8">
              <h3 className="font-heading text-xl font-black tracking-wide text-white uppercase mb-6">Gửi Yêu Cầu Liên Hệ</h3>

              {success ? (
                <div className="flex flex-col items-center py-16 text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-emerald-400" strokeWidth={1.5} />
                  <h4 className="text-xl font-bold text-white uppercase font-heading">Đã gửi thành công</h4>
                  <p className="text-xs text-zinc-400 font-medium">
                    Cảm ơn bạn. Camera 247 Huế sẽ liên hệ lại với bạn trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-xs font-bold uppercase tracking-wider text-[#F5C518] hover:underline pt-4"
                  >
                    Gửi yêu cầu mới
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518] focus:bg-white/[0.04] transition-all font-medium"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518] focus:bg-white/[0.04] transition-all font-medium"
                        placeholder="0967 611 112"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Địa chỉ Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518] focus:bg-white/[0.04] transition-all font-medium"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                      Dịch vụ cần tư vấn
                    </label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-[#0D0E10] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-[#F5C518] transition-all font-medium appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <option value="">— Chọn dịch vụ —</option>
                      {services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Yêu cầu chi tiết</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518] focus:bg-white/[0.04] transition-all font-medium"
                      placeholder="Mô tả chi tiết nhu cầu hoặc khảo sát của bạn…"
                    />
                  </div>

                  {error ? <p className="text-xs font-semibold text-rose-400">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F5C518] text-xs font-bold uppercase tracking-widest text-black hover:bg-white active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Đang gửi thông tin…
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" strokeWidth={2} />
                        <span>Gửi yêu cầu tư vấn</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
