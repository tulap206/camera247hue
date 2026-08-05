'use client'

const stats = [
  { value: '1,200+', label: 'Công trình hoàn thành', desc: 'Hộ gia đình, chuỗi cửa hàng, resort tại Huế' },
  { value: '12+ Năm', label: 'Tích hợp hệ thống', desc: 'Đội ngũ kỹ sư CNTT & An ninh chuyên sâu' },
  { value: '24/7/365', label: 'Hỗ trợ kỹ thuật', desc: 'Cam kết xử lý nhanh trong vòng 2 giờ' },
  { value: '98%', label: 'Khách hàng hài lòng', desc: 'Tỷ lệ phản hồi hài lòng cao nhất khu vực' },
]

export default function StatsSection() {
  return (
    <section className="relative bg-[#050505] border-y border-white/5 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:divide-x lg:divide-white/5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`space-y-2 lg:px-8 ${i === 0 ? 'lg:pl-0' : ''}`}
            >
              <div className="font-heading text-4xl sm:text-5xl font-black text-[#F5C518] tracking-tight filter drop-shadow-[0_0_12px_rgba(245,197,24,0.1)]">
                {s.value}
              </div>
              <div className="space-y-1">
                <p className="text-white text-xs font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-zinc-500 text-[11px] font-medium leading-relaxed max-w-[22ch]">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
