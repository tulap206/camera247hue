'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Phone, MapPin, Facebook, Mail, Clock, Send, CheckCircle } from 'lucide-react'

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
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          service: form.service,
          message: form.message,
        }),
      })

      setLoading(false)
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', phone: '', email: '', service: '', message: '' })
      } else {
        const errData = await res.json()
        console.error('Submit error:', errData.error)
        setError('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp qua điện thoại.')
      }
    } catch (err: any) {
      setLoading(false)
      console.error('Submit catch error:', err)
      setError('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp qua điện thoại.')
    }
  }

  return (
    <section id="lien-he" className="py-24 bg-brand-dark relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[#F5C518] text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-8 h-0.5 bg-[#F5C518]" />
            Liên Hệ
            <span className="w-8 h-0.5 bg-[#F5C518]" />
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-white leading-none tracking-tight">
            LIÊN HỆ TƯ VẤN
            <span className="bg-gradient-to-r from-[#F5C518] to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,197,24,0.2)]"> MIỄN PHÍ</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mt-4 text-sm sm:text-base">
            Đội ngũ kỹ thuật của chúng tôi sẵn sàng tư vấn giải pháp tối ưu và báo giá nhanh chóng 
            cho mọi nhu cầu an ninh và hạ tầng mạng của bạn.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="space-y-4 mb-6">
              {[
                {
                  icon: Phone,
                  title: 'Điện Thoại / Zalo',
                  lines: ['0967 611 112', '0777 611 112'],
                  action: 'tel:0967611112'
                },
                {
                  icon: MapPin,
                  title: 'Địa Chỉ',
                  lines: ['40 Tùng Thiện Vương', 'Phường Vỹ Dạ, Tp. Huế'],
                  action: 'https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế'
                },
                {
                  icon: Facebook,
                  title: 'Facebook',
                  lines: ['Facebook.com/Camera247Hue'],
                  action: 'https://facebook.com/Camera247Hue'
                },
                {
                  icon: Clock,
                  title: 'Giờ Làm Việc',
                  lines: ['Thứ 2 – Thứ 7: 7:30 – 18:00', 'Chủ Nhật: 8:00 – 12:00'],
                  action: null
                },
              ].map((item) => (
                <div key={item.title}
                  className="flex items-start gap-4 p-4 glass-panel rounded-2xl border border-white/5 hover:border-yellow-500/25 hover:bg-white/5 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F5C518] group-hover:border-transparent transition-all duration-300 mt-0.5">
                    <item.icon className="w-5 h-5 text-[#F5C518] group-hover:text-black transition-colors" />
                  </div>
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider mb-0.5">{item.title}</div>
                    {item.lines.map((line) => (
                      item.action ? (
                        <a key={line} href={item.action} target="_blank" rel="noopener noreferrer"
                          className="block text-white font-bold text-sm sm:text-base hover:text-[#F5C518] transition-colors leading-tight">
                          {line}
                        </a>
                      ) : (
                        <div key={line} className="text-white font-bold text-sm sm:text-base leading-tight">{line}</div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map embed placeholder */}
            <div className="rounded-[24px] overflow-hidden border border-white/5 h-64 relative group shadow-2xl">
              <iframe
                src="https://maps.google.com/maps?q=40%20T%C3%B9ng%20Thi%E1%BB%87n%20V%C6%B0%C6%A1ng%2C%20V%E1%BB%B9%20D%E1%BA%A1%2C%20Th%C3%A0nh%20ph%E1%BB%91%20Hu%E1%BA%BF&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(120%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 border border-white/5 group-hover:border-yellow-500/20 transition-colors pointer-events-none rounded-[24px]" />
            </div>
          </div>

          {/* Contact form */}
          <div className="glass-panel rounded-[28px] p-6 sm:p-8 border border-white/5 shadow-2xl relative">
            <h3 className="font-heading text-xl font-bold text-white mb-6 uppercase tracking-wider">
              GỬI YÊU CẦU TƯ VẤN
            </h3>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                <h4 className="text-white font-bold text-xl mb-2">Gửi Thành Công!</h4>
                <p className="text-gray-400 mb-6 text-sm">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ gọi lại trong thời gian sớm nhất.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-[#F5C518] hover:underline text-sm font-bold"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Họ và Tên *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({...p, name: e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5C518] focus:shadow-neon-gold transition-all duration-300"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5C518] focus:shadow-neon-gold transition-all duration-300"
                      placeholder="0967 611 112"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({...p, email: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5C518] focus:shadow-neon-gold transition-all duration-300"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Dịch Vụ Cần Tư Vấn</label>
                  <select
                    value={form.service}
                    onChange={e => setForm(p => ({...p, service: e.target.value}))}
                    className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3 text-gray-300 text-sm focus:outline-none focus:border-[#F5C518] focus:shadow-neon-gold transition-all duration-300"
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Nội Dung</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(p => ({...p, message: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5C518] focus:shadow-neon-gold transition-all duration-300 resize-none"
                    placeholder="Mô tả nhu cầu của bạn..."
                  />
                </div>

                {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F5C518] to-amber-500 text-black py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Đang gửi...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi Yêu Cầu Tư Vấn
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
