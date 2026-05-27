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
    <section id="lien-he" className="py-20 bg-[#111111] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 hazard-stripe opacity-40" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[#F5C518] text-sm font-medium mb-4 tracking-widest uppercase">
            <span className="w-8 h-px bg-[#F5C518]" />
            Liên Hệ
            <span className="w-8 h-px bg-[#F5C518]" />
          </div>
          <h2 style={{ fontFamily: 'Oswald, sans-serif' }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4">
            LIÊN HỆ TƯ VẤN
            <span className="text-[#F5C518]"> MIỄN PHÍ</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Đội ngũ kỹ thuật của chúng tôi sẵn sàng tư vấn và báo giá miễn phí 
            cho mọi nhu cầu an ninh của bạn.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <div className="space-y-5 mb-8">
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
                  className="flex items-start gap-4 p-4 bg-[#1A1A1A] rounded-xl border border-gray-800 hover:border-[#F5C518]/30 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-[#F5C518]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F5C518]/20 transition-colors">
                    <item.icon className="w-5 h-5 text-[#F5C518]" />
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">{item.title}</div>
                    {item.lines.map((line) => (
                      item.action ? (
                        <a key={line} href={item.action} target="_blank" rel="noopener noreferrer"
                          className="block text-white font-semibold hover:text-[#F5C518] transition-colors">
                          {line}
                        </a>
                      ) : (
                        <div key={line} className="text-white font-medium">{line}</div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map embed placeholder */}
            <div className="rounded-xl overflow-hidden border border-gray-800 h-48">
              <iframe
                src="https://maps.google.com/maps?q=40%20T%C3%B9ng%20Thi%E1%BB%87n%20V%C6%B0%C6%A1ng%2C%20V%E1%BB%B9%20D%E1%BA%A1%2C%20Th%C3%A0nh%20ph%E1%BB%91%20Hu%E1%BA%BF&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800">
            <h3 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-xl font-bold text-white mb-6">
              GỬI YÊU CẦU TƯ VẤN
            </h3>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                <h4 className="text-white font-bold text-xl mb-2">Gửi Thành Công!</h4>
                <p className="text-gray-400 mb-6">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ gọi lại trong thời gian sớm nhất.
                </p>
                <button
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
                      onChange={e => setForm(p => ({...p, name: e.target.value}))}
                      className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                      className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
                      placeholder="0967 611 112"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({...p, email: e.target.value}))}
                    className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Dịch Vụ Cần Tư Vấn</label>
                  <select
                    value={form.service}
                    onChange={e => setForm(p => ({...p, service: e.target.value}))}
                    className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Nội Dung</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(p => ({...p, message: e.target.value}))}
                    className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518] transition-colors resize-none"
                    placeholder="Mô tả nhu cầu của bạn..."
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F5C518] text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
