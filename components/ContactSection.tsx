'use client'

import { useState } from 'react'
import { Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, ShieldCheck, ArrowUpRight } from 'lucide-react'
import Reveal from '@/components/Reveal'

const popularServices = [
  'Camera gia đình',
  'Camera biệt thự',
  'Camera cafe / shop',
  'Khóa cửa vân tay',
  'Mạng Wifi Mesh',
  'Khác',
]

export default function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: 'Camera gia đình',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại liên hệ.')
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
        setForm({ name: '', phone: '', service: 'Camera gia đình', message: '' })
      } else {
        setError('Có lỗi xảy ra. Quý khách vui lòng gọi trực tiếp hotline để được hỗ trợ ngay.')
      }
    } catch {
      setLoading(false)
      setError('Có lỗi xảy ra. Quý khách vui lòng gọi trực tiếp hotline để được hỗ trợ ngay.')
    }
  }

  return (
    <section id="lien-he" className="section-y bg-brand-bg/60 relative">
      <div className="container-page">
        {/* Header */}
        <Reveal className="max-w-2xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-brand-navy text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-navy" />
            Tư vấn & Khảo sát tận nơi
          </div>
          <h2 className="font-heading text-[1.75rem] sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
            Liên hệ tư vấn miễn phí
          </h2>
          <p className="text-brand-muted leading-relaxed text-[15px] sm:text-base">
            Kỹ thuật viên Camera 247 Huế khảo sát trực tiếp và đo góc camera tận nơi tại TP. Huế trong vòng 2 giờ. Báo giá trọn gói minh bạch, cam kết không phát sinh.
          </p>
        </Reveal>

        {/* 2-Column Balanced Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Cột trái: Thông tin trực tiếp & Bản đồ (5 cols) */}
          <Reveal className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Direct Contact Card */}
            <div className="rounded-[22px] bg-white border border-brand-border p-5 sm:p-6 shadow-soft space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-navy text-brand-yellow flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-brand-navy text-base">
                    Hotline Kỹ Thuật 24/7
                  </h3>
                  <p className="text-xs text-brand-muted">Phản ứng nhanh trong 2h tại TP. Huế</p>
                </div>
              </div>

              {/* 2 Phone buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href="tel:0796785151"
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-bg hover:bg-brand-yellow/10 border border-brand-border hover:border-brand-yellow/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-brand-navy group-hover:text-brand-yellow-dark shrink-0" />
                    <div className="truncate">
                      <div className="text-xs text-brand-muted font-medium leading-none">Chính (Kỹ thuật)</div>
                      <div className="text-sm font-extrabold text-brand-navy mt-1 font-heading">0796 785 151</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-brand-navy bg-brand-yellow/30 px-2 py-0.5 rounded shrink-0">Tước</span>
                </a>

                <a
                  href="tel:0967611112"
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-bg hover:bg-brand-yellow/10 border border-brand-border hover:border-brand-yellow/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-brand-navy group-hover:text-brand-yellow-dark shrink-0" />
                    <div className="truncate">
                      <div className="text-xs text-brand-muted font-medium leading-none">Phụ (Hỗ trợ)</div>
                      <div className="text-sm font-extrabold text-brand-navy mt-1 font-heading">0967 611 112</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-brand-navy bg-white border border-brand-border px-2 py-0.5 rounded shrink-0">Lập</span>
                </a>
              </div>

              {/* Zalo quick action button */}
              <a
                href="https://zalo.me/0796785151"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0068FF]/10 text-[#0068FF] hover:bg-[#0068FF] hover:text-white transition-colors text-xs font-bold font-heading"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn tin Zalo tư vấn nhanh (0796 785 151)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {/* Address & Hours */}
              <div className="pt-4 border-t border-brand-border/70 space-y-2 text-xs text-brand-muted">
                <a
                  href="https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-brand-navy hover:text-brand-yellow-dark font-medium transition-colors"
                >
                  <MapPin className="w-4 h-4 text-brand-yellow-dark shrink-0 mt-0.5" />
                  <span>40 Tùng Thiện Vương, Phường Vỹ Dạ, TP. Huế</span>
                </a>
                <div className="flex items-center gap-2.5 text-brand-muted pl-0.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Mở cửa: 7:30 – 18:00 (Thứ 2 – Chủ Nhật)</span>
                </div>
              </div>
            </div>

            {/* Google Maps Frame */}
            <div className="rounded-[22px] overflow-hidden border border-brand-border h-48 sm:h-52 bg-white shadow-soft relative">
              <iframe
                src="https://maps.google.com/maps?q=40%20T%C3%B9ng%20Thi%E1%BB%87n%20V%C6%B0%C6%A1ng%2C%20V%E1%BB%B9%20D%E1%BA%A1%2C%20Th%C3%A0nh%20ph%E1%BB%91%20Hu%E1%BA%BF&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ vị trí Camera 247 Huế"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-brand-navy/90 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 shadow-md">
                <MapPin className="w-3 h-3 text-brand-yellow" />
                <span>40 Tùng Thiện Vương, Vỹ Dạ</span>
              </div>
            </div>
          </Reveal>

          {/* Cột phải: Form gửi yêu cầu tư vấn thông minh (7 cols) */}
          <Reveal delay={0.05} className="lg:col-span-7">
            <div className="h-full rounded-[24px] bg-white border border-brand-border p-6 sm:p-8 shadow-soft flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="font-heading font-extrabold text-xl text-brand-navy">
                    Đăng ký khảo sát tận nơi
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted mt-1">
                    Điền thông tin bên dưới, kỹ sư của Camera 247 Huế sẽ liên hệ lại trong vòng 15 phút.
                  </p>
                </div>

                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-heading font-bold text-lg text-brand-navy">
                      Gửi yêu cầu thành công!
                    </h4>
                    <p className="text-brand-muted text-sm max-w-sm">
                      Cảm ơn Quý khách. Kỹ thuật viên của Camera 247 Huế sẽ gọi lại ngay để tư vấn và sắp xếp lịch khảo sát.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSuccess(false)}
                      className="mt-4 text-brand-navy font-bold text-xs uppercase tracking-wider hover:underline"
                    >
                      Gửi thêm yêu cầu khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Dịch vụ cần tư vấn - Smart Chips selector */}
                    <div className="space-y-2">
                      <label className="block text-brand-navy text-xs font-bold uppercase tracking-wider">
                        Dịch vụ quan tâm
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {popularServices.map((srv) => {
                          const isSelected = form.service === srv
                          return (
                            <button
                              key={srv}
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, service: srv }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-brand-navy text-brand-yellow border-brand-navy shadow-sm'
                                  : 'bg-brand-bg text-brand-muted border-brand-border hover:border-brand-navy/30 hover:text-brand-navy'
                              }`}
                            >
                              {srv}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Họ tên & Số điện thoại */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="block text-brand-muted text-xs font-semibold">
                          Họ và tên của bạn *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="input-field !bg-brand-bg/50 focus:!bg-white text-sm"
                          placeholder="VD: Anh Minh"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-brand-muted text-xs font-semibold">
                          Số điện thoại / Zalo *
                        </label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          className="input-field !bg-brand-bg/50 focus:!bg-white text-sm"
                          placeholder="VD: 0796 785 151"
                        />
                      </div>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="space-y-1.5">
                      <label className="block text-brand-muted text-xs font-semibold">
                        Nhu cầu chi tiết (vị trí lắp, số lượng camera...)
                      </label>
                      <textarea
                        rows={3}
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        className="input-field !bg-brand-bg/50 focus:!bg-white text-sm resize-none"
                        placeholder="VD: Cần lắp 4 camera cho nhà 2 tầng tại Vỹ Dạ, TP. Huế..."
                      />
                    </div>

                    {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-accent w-full !py-3.5 !text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin" />
                            Đang gửi thông tin...
                          </span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Gửi yêu cầu khảo sát miễn phí</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
                <span>🔒 Bảo mật thông tin khách hàng</span>
                <span>⚡ Phản hồi trong 15 phút</span>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
