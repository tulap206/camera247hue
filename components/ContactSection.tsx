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

  const contactItems = [
    {
      icon: Phone,
      title: 'Điện thoại / Zalo',
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
      title: 'Facebook',
      lines: ['Facebook.com/Camera247Hue'],
      action: 'https://facebook.com/Camera247Hue',
    },
    {
      icon: Clock,
      title: 'Giờ làm việc',
      lines: ['Thứ 2 - Thứ 7: 7:30 - 18:00', 'Chủ Nhật: 8:00 - 12:00'],
      action: null,
    },
  ]

  return (
    <section id="lien-he" className="py-24 sm:py-28 bg-white">
      <div className="container-page">
        <Reveal className="max-w-xl mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
            Liên hệ tư vấn miễn phí
          </h2>
          <p className="text-brand-muted leading-relaxed">
            Để lại thông tin hoặc gọi trực tiếp. Chúng tôi sẽ khảo sát và báo giá phù hợp nhu cầu của bạn.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <Reveal>
            <div className="space-y-3 mb-6">
              {contactItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-[16px] border border-brand-border bg-brand-bg/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-brand-navy" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-brand-muted text-xs mb-1">{item.title}</div>
                    {item.lines.map((line) =>
                      item.action ? (
                        <a
                          key={line}
                          href={item.action}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-brand-navy font-semibold hover:text-[#16324A] transition-colors text-sm"
                        >
                          {line}
                        </a>
                      ) : (
                        <div key={line} className="text-brand-ink font-medium text-sm">
                          {line}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[16px] overflow-hidden border border-brand-border h-48">
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

          <Reveal delay={0.08}>
            <div className="rounded-[24px] border border-brand-border bg-brand-bg/40 p-6 sm:p-8">
              <h3 className="font-heading font-bold text-xl text-brand-navy mb-6">Gửi yêu cầu tư vấn</h3>

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
                        placeholder="0967 611 112"
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
