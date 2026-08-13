'use client'

import Reveal from '@/components/Reveal'

const steps = [
  {
    num: '01',
    title: 'Khảo sát tận nơi',
    desc: 'Đánh giá hiện trạng, nhu cầu giám sát và điều kiện thi công thực tế.',
  },
  {
    num: '02',
    title: 'Báo giá rõ ràng',
    desc: 'Đề xuất thiết bị phù hợp ngân sách, có danh mục và chi phí minh bạch.',
  },
  {
    num: '03',
    title: 'Thi công chuẩn kỹ thuật',
    desc: 'Lắp đặt gọn gàng, đi dây thẩm mỹ, bàn giao đúng tiến độ đã cam kết.',
  },
  {
    num: '04',
    title: 'Bảo hành và hỗ trợ',
    desc: 'Bảo hành thiết bị 12-24 tháng, hỗ trợ kỹ thuật nhanh trong khu vực Huế.',
  },
]

export default function ProcessSection() {
  return (
    <section id="quy-trinh" className="py-24 sm:py-28 bg-brand-soft">
      <div className="container-page">
        <Reveal className="max-w-xl mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-4">
            Quy trình làm việc chuyên nghiệp
          </h2>
          <p className="text-brand-muted leading-relaxed max-w-[48ch]">
            Từ khảo sát đến bảo hành, mỗi bước đều rõ ràng để bạn yên tâm triển khai.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.06}>
              <div className="h-full bg-white rounded-[20px] p-6 border border-brand-border/80">
                <div className="font-heading font-extrabold text-3xl text-brand-yellow mb-5 font-tabular">
                  {step.num}
                </div>
                <h3 className="font-heading font-bold text-lg text-brand-navy mb-2">{step.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
