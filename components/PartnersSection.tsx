'use client'

import Reveal from '@/components/Reveal'

const partners = ['Hikvision', 'Dahua', 'Panasonic', 'UniFi', 'TP-Link', 'Ezviz']

export default function PartnersSection() {
  return (
    <section className="bg-white border-b border-brand-border">
      <div className="container-page py-8 sm:py-12">
        <Reveal>
          <p className="text-xs sm:text-sm text-brand-muted mb-4 sm:mb-0 lg:hidden">
            Thiết bị chính hãng
          </p>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-12">
            <p className="hidden lg:block text-sm text-brand-muted shrink-0 lg:max-w-[180px] leading-relaxed">
              Thiết bị chính hãng từ các thương hiệu hàng đầu
            </p>
            <div className="flex gap-6 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-x-6 sm:overflow-visible scrollbar-none scroll-snap-x">
              {partners.map((name) => (
                <div
                  key={name}
                  className="font-heading font-bold text-brand-navy/40 text-sm sm:text-base tracking-tight whitespace-nowrap shrink-0"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
