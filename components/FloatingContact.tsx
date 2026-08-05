'use client'

import { useState } from 'react'
import { MessageCircle, Phone, X, Facebook } from 'lucide-react'

function ZaloIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.49 10.272v-.45h2.403c.275 0 .449.172.449.45v4.95c0 .277-.174.45-.45.45h-.45v-4.95H12.49zM7.61 10.274a.45.45 0 0 0-.45.45v4.95h.9v-1.8h1.35c.276 0 .45-.173.45-.45v-2.7c0-.277-.174-.45-.45-.45H7.61zm1.35 2.7H8.06v-1.8h.9v1.8zm10.538-2.7h-2.7c-.276 0-.45.173-.45.45v4.95h.9v-4.5h.45v4.5h.9v-4.5h.45v4.5h.9v-4.95c0-.277-.174-.45-.45-.45zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}

const contacts = [
  {
    id: 'phone',
    label: 'Gọi điện',
    sublabel: '0967 611 112',
    href: 'tel:0967611112',
    color: '#22c55e',
    icon: Phone,
  },
  {
    id: 'zalo',
    label: 'Zalo Chat',
    sublabel: 'Nhắn Zalo',
    href: 'https://zalo.me/0967611112',
    color: '#0068FF',
    icon: ZaloIcon,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    sublabel: 'Messenger',
    href: 'https://m.me/Camera247Hue',
    color: '#1877F2',
    icon: Facebook,
  },
]

export default function FloatingContact() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-4">
      {open && (
        <div className="mb-2 flex flex-col items-end gap-3.5">
          {contacts.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target={c.id !== 'phone' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="rounded-2xl border border-white/10 bg-[#0D0E10]/95 px-4 py-2.5 text-right shadow-2xl backdrop-blur-2xl">
                <span className="block text-xs font-bold text-white uppercase tracking-wider">{c.label}</span>
                <span className="text-[10px] font-bold text-[#F5C518] mt-0.5 block">{c.sublabel}</span>
              </span>
              <span
                className="flex w-12 h-12 items-center justify-center rounded-full text-white shadow-2xl"
                style={{ backgroundColor: c.color }}
              >
                <c.icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-14 h-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          open 
            ? 'bg-zinc-800 text-white border border-white/10' 
            : 'bg-[#F5C518] text-black hover:bg-white'
        }`}
      >
        {open ? <X className="w-5 h-5" strokeWidth={1.5} /> : <MessageCircle className="w-5 h-5" strokeWidth={1.5} />}
      </button>
    </div>
  )
}
