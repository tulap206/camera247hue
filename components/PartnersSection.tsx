'use client'

import { Marquee } from '@/components/magicui/marquee'

interface BrandItem {
  id: string
  name: string
  sub?: string
  logo: React.ReactNode
}

function HikvisionLogo() {
  return (
    <div className="flex items-center gap-1 font-heading font-black tracking-tighter text-sm sm:text-base">
      <span className="text-[#E60012]">HIK</span>
      <span className="text-zinc-800 group-hover:text-[#E60012] transition-colors">VISION</span>
    </div>
  )
}

function DahuaLogo() {
  return (
    <div className="flex items-center gap-1.5 font-heading font-bold text-sm sm:text-base">
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E30613]" />
      <span className="text-zinc-800 lowercase group-hover:text-[#E30613] transition-colors font-extrabold tracking-tight">
        dahua
      </span>
      <span className="text-[8px] text-zinc-400 font-normal uppercase tracking-widest hidden sm:inline">Technology</span>
    </div>
  )
}

function KbvisionLogo() {
  return (
    <div className="flex items-center gap-1 font-heading font-black text-sm sm:text-base tracking-tight text-zinc-800 group-hover:text-[#005BAC] transition-colors">
      <span className="text-[#005BAC]">KB</span>
      <span>VISION</span>
    </div>
  )
}

function ImouLogo() {
  return (
    <div className="flex items-center gap-1 font-heading font-extrabold text-sm sm:text-base text-zinc-800">
      <span className="text-[#F37021]">I</span>
      <span className="text-[#F37021] group-hover:text-[#FF8D44] transition-colors">mou</span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#F37021]" />
    </div>
  )
}

function EzvizLogo() {
  return (
    <div className="flex items-center gap-1.5 font-heading font-black text-sm sm:text-base">
      <span className="flex gap-0.5">
        <span className="w-1.5 h-3 bg-[#00A0E9] rounded-sm" />
        <span className="w-1.5 h-3 bg-[#E60012] rounded-sm" />
        <span className="w-1.5 h-3 bg-[#8FC31F] rounded-sm" />
      </span>
      <span className="text-zinc-800 group-hover:text-[#00A0E9] transition-colors tracking-wider uppercase">
        EZVIZ
      </span>
    </div>
  )
}

function UnifiLogo() {
  return (
    <div className="flex items-center gap-1.5 font-heading font-extrabold text-sm sm:text-base">
      <div className="w-4 h-4 rounded bg-[#006FFF] text-white flex items-center justify-center text-[10px] font-black">
        U
      </div>
      <span className="text-zinc-800 group-hover:text-[#006FFF] transition-colors">UniFi</span>
      <span className="text-[8px] text-zinc-400 font-mono hidden sm:inline">Ubiquiti</span>
    </div>
  )
}

function TplinkLogo() {
  return (
    <div className="flex items-center gap-1.5 font-heading font-bold text-sm sm:text-base">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#4ACBD6] flex items-center justify-center">
        <span className="w-1 h-1 bg-[#4ACBD6] rounded-full" />
      </div>
      <span className="text-zinc-800 group-hover:text-[#4ACBD6] transition-colors lowercase tracking-tight">
        tp-link
      </span>
    </div>
  )
}

function ZktecoLogo() {
  return (
    <div className="flex items-center gap-1 font-heading font-black text-sm sm:text-base">
      <span className="text-[#68B637]">ZK</span>
      <span className="text-zinc-800 group-hover:text-[#68B637] transition-colors">Teco</span>
    </div>
  )
}

function RuijieLogo() {
  return (
    <div className="flex items-center gap-1.5 font-heading font-bold text-sm sm:text-base">
      <span className="text-[#004B98] font-black">Ruijie</span>
      <span className="text-zinc-300">|</span>
      <span className="text-[#E60012] font-semibold text-xs uppercase">Reyee</span>
    </div>
  )
}

const BRANDS: BrandItem[] = [
  { id: 'hikvision', name: 'Hikvision', sub: 'Camera AI', logo: <HikvisionLogo /> },
  { id: 'dahua', name: 'Dahua', sub: 'Camera 4K', logo: <DahuaLogo /> },
  { id: 'kbvision', name: 'KBVISION', sub: 'USA Security', logo: <KbvisionLogo /> },
  { id: 'imou', name: 'Imou', sub: 'Smart Home', logo: <ImouLogo /> },
  { id: 'ezviz', name: 'Ezviz', sub: 'Camera Wifi', logo: <EzvizLogo /> },
  { id: 'unifi', name: 'UniFi', sub: 'Mạng Doanh Nghiệp', logo: <UnifiLogo /> },
  { id: 'tplink', name: 'TP-Link', sub: 'Wifi Router', logo: <TplinkLogo /> },
  { id: 'zkteco', name: 'ZKTeco', sub: 'Khóa & Chấm Công', logo: <ZktecoLogo /> },
  { id: 'ruijie', name: 'Ruijie', sub: 'Wifi Chuyên Dụng', logo: <RuijieLogo /> },
]

export default function PartnersSection() {
  return (
    <section className="bg-white border-b border-brand-border py-6 sm:py-8 overflow-hidden" aria-label="Thương hiệu đối tác chính hãng">
      <div className="container-page mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-yellow" />
            <h2 className="text-xs sm:text-sm font-heading font-bold text-brand-navy uppercase tracking-wider">
              Thương hiệu thiết bị chính hãng 100%
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-brand-muted">
            Phân phối, lắp đặt & bảo hành chính hãng tại TP. Huế
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Soft edge fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <Marquee pauseOnHover className="[--duration:28s] [--gap:1.25rem]">
          {BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="group inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-xl bg-brand-bg/60 hover:bg-white border border-brand-border/80 hover:border-brand-yellow hover:shadow-soft transition-all duration-300 cursor-default shrink-0"
            >
              {brand.logo}
              {brand.sub && (
                <span className="text-[10px] text-brand-muted font-medium bg-white group-hover:bg-brand-soft px-2 py-0.5 rounded border border-brand-border/60 transition-colors">
                  {brand.sub}
                </span>
              )}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
