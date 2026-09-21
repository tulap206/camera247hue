'use client'

import { useState } from 'react'
import { Phone, MapPin, Facebook, Clock, Send, CheckCircle } from 'lucide-react'
import Reveal from '@/components/Reveal'

const services = [
  'Camera an ninh',
  'Khóa cửa thông minh',
  'Hệ thống mạng',
  'Báo trộm và định vị',
  'Máy chấm công',
  'Máy tính và thiết bị',
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
        setError('Có lỗi xảy ra. Vui lòng thử lại hoặc gọi trực tiếp.')
      }
    } catch {
      setLoading(false)
      setError('Có lỗi xảy ra. Vui lòng thử lại hoặc gọi trực tiếp.')
    }
  }

  return (
    <section id="lien-he" className="section-y bg-white">
      <div className="container-page">
        <Reveal className="max-w-xl mb-8 sm:mb-12">
          <h2 className="font-heading text-[1.65rem] sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
            Liên hệ tư vấn miễn phí
          </h2>
          <p className="text-brand-muted leading-relaxed text-[15px] sm:text-base">
            Để lại thông tin hoặc gọi trực tiếp. Chúng tôi sẽ khảo sát và báo giá phù hợp nhu cầu của bạn.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          <Reveal className="order-2 lg:order-1">
            <div className="space-y-3.5 mb-6">
              {/* Hotline Card */}
              <div className="p-4 sm:p-5 rounded-[18px] border border-brand-border bg-brand-bg/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-yellow/15 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-navy" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-brand-muted text-xs font-medium">Hotline Kỹ Thuật & Zalo (24/7)</div>
                    <div className="text-brand-navy font-bold text-sm">Hỗ trợ tư vấn và xử lý sự cố</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-brand-border/60">
                  <a
                    href="tel:0796785151"
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white border border-brand-border hover:border-brand-yellow text-brand-navy font-bold text-sm transition-colors shadow-sm"
                  >
                    <span>0796 785 151</span>
                    <span className="text-xs font-semibold text-brand-muted bg-brand-soft px-2 py-0.5 rounded">Tước</span>
                  </a>
                  <a
                    href="tel:0967611112"
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white border border-brand-border hover:border-brand-yellow text-brand-navy font-bold text-sm transition-colors shadow-sm"
                  >
                    <span>0967 611 112</span>
                    <span className="text-xs font-semibold text-brand-muted bg-brand-soft px-2 py-0.5 rounded">Lập</span>
                  </a>
                </div>
              </div>

              {/* Address & Hours Card */}
              <div className="p-4 sm:p-5 rounded-[18px] border border-brand-border bg-brand-bg/60 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-brand-navy" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-brand-muted text-xs font-medium">Văn phòng & Trung tâm kỹ thuật</div>
                    <a
                      href="https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-navy font-semibold text-sm hover:underline block leading-snug mt-0.5"
                    >
                      40 Tùng Thiện Vương, Phường Vỹ Dạ, Tp. Huế
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-brand-border/60 text-xs text-brand-muted">
                  <Clock className="w-4 h-4 text-brand-navy shrink-0" />
                  <span>Giờ làm việc: 7:30 – 18:00 (Thứ 2 – Chủ Nhật)</span>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] overflow-hidden border border-brand-border h-48 sm:h-52 shadow-sm">
              <iframe
                src="https://maps.google.com/maps?q=40%20T%C3%B9ng%20Thi%E1%BB%87n%20V%C6%B0%C6%A1ng%2C%20V%E1%BB%B9%20D%E1%BA%A1%2C%20Th%C3%A0nh%20ph%E1%BB%91%20Hu%E1%BA%BF&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Camera 247 Huế"
              />
            </div>
          </Reveal>

          <Reveal delay={0.08} className="order-1 lg:order-2">
            <div className="rounded-2xl sm:rounded-[24px] border border-brand-border bg-brand-bg/40 p-5 sm:p-8">
              <h3 className="font-heading font-bold text-lg sm:text-xl text-brand-navy mb-5 sm:mb-6">Gửi yêu cầu tư vấn</h3>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
                  <h4 className="font-heading font-bold text-lg text-brand-navy mb-2">Gửi thành công</h4>
                  <p className="text-brand-muted mb-6 text-sm max-w-xs">
                    Cảm ơn bạn đã liên hệ. Chúng tôi sẽ gọi lại trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-brand-navy font-semibold text-sm hover:underline"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-brand-muted text-xs mb-1.5 font-medium">Họ và tên *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="input-field"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-muted text-xs mb-1.5 font-medium">Số điện thoại *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        className="input-field"
                        placeholder="0796 785 151"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-brand-muted text-xs mb-1.5 font-medium">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-muted text-xs mb-1.5 font-medium">Dịch vụ cần tư vấn</label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Chọn dịch vụ</option>
                      {services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-brand-muted text-xs mb-1.5 font-medium">Nội dung</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      className="input-field resize-none"
                      placeholder="Mô tả nhu cầu của bạn..."
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-accent w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin" />
                        Đang gửi...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Gửi yêu cầu
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
