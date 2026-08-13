'use client'

import Reveal from '@/components/Reveal'

const partners = ['Hikvision', 'Dahua', 'Panasonic', 'UniFi', 'TP-Link', 'Ezviz']

export default function PartnersSection() {
  return (
    <section className="bg-white border-b border-brand-border">
      <div className="container-page py-10 sm:py-12">
        <Reveal className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
          <p className="text-sm text-brand-muted shrink-0 lg:max-w-[180px] leading-relaxed">
            Thiết bị chính hãng từ các thương hiệu hàng đầu
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 flex-1">
            {partners.map((name) => (
              <div
                key={name}
                className="font-heading font-bold text-brand-navy/35 text-sm sm:text-base tracking-tight"
              >
                {name}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
