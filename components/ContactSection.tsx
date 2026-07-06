'use client'

import { useState } from 'react'
import { Phone, MapPin, Facebook, Clock, Send, CheckCircle } from 'lucide-react'
import Reveal from '@/components/Reveal'

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
        const errData = await res.json()
        console.error('Submit error:', errData.error)
        setError('Có lỗi xảy ra. Vui lòng thử lại hoặc gọi trực tiếp.')
      }
    } catch (err: unknown) {
      setLoading(false)
      console.error('Submit catch error:', err)
      setError('Có lỗi xảy ra. Vui lòng thử lại hoặc gọi trực tiếp.')
    }
  }

  const contactItems = [
    {
      icon: Phone,
      title: 'Điện Thoại / Zalo',
      lines: ['0967 611 112', '0777 611 112'],
      action: 'tel:0967611112',
    },
    {
      icon: MapPin,
      title: 'Địa Chỉ',
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
      title: 'Giờ Làm Việc',
      lines: ['Thứ 2 - Thứ 7: 7:30 - 18:00', 'Chủ Nhật: 8:00 - 12:00'],
      action: null,
    },
  ]

  return (
    <section id="lien-he" className="py-20 sm:py-24 bg-[#0F0F0F] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5C518]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-xl">
          <h2
            style={{ fontFamily: 'Oswald, sans-serif' }}
            className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight"
          >
            LIÊN HỆ TƯ VẤN
            <span className="text-[#F5C518]"> MIỄN PHÍ</span>
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Đội ngũ kỹ thuật sẵn sàng tư vấn và báo giá cho mọi nhu cầu an ninh của bạn.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
          <Reveal>
            <div className="space-y-3 mb-6">
              {contactItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 surface-card hover:bg-[#1C1C1C] group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F5C518]/10 flex items-center justify-center shrink-0 group-hover:bg-[#F5C518]/18 transition-colors">
                    <item.icon className="w-5 h-5 text-[#F5C518]" />
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">{item.title}</div>
                    {item.lines.map((line) =>
                      item.action ? (
                        <a
                          key={line}
                          href={item.action}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-white font-medium hover:text-[#F5C518] transition-colors text-sm"
                        >
                          {line}
                        </a>
                      ) : (
                        <div key={line} className="text-white font-medium text-sm">
                          {line}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 h-48">
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

          <Reveal delay={0.1}>
            <div className="surface-card p-6 sm:p-7">
              <h3
                style={{ fontFamily: 'Oswald, sans-serif' }}
                className="text-xl font-bold text-white mb-6"
              >
                GỬI YÊU CẦU TƯ VẤN
              </h3>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-14 h-14 text-emerald-400 mb-4" />
                  <h4 className="text-white font-bold text-lg mb-2">Gửi thành công</h4>
                  <p className="text-gray-400 mb-6 text-sm max-w-xs">
                    Cảm ơn bạn đã liên hệ. Chúng tôi sẽ gọi lại trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-[#F5C518] hover:underline text-sm"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1.5">Họ và Tên *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="input-field"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1.5">Số Điện Thoại *</label>
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
                    <label className="block text-gray-400 text-xs mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Dịch Vụ Cần Tư Vấn</label>
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
                    <label className="block text-gray-400 text-xs mb-1.5">Nội Dung</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      className="input-field resize-none"
                      placeholder="Mô tả nhu cầu của bạn..."
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Đang gửi...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Gửi Yêu Cầu
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
