'use client'

import { useState } from 'react'
import { MessageCircle, Phone, X, Facebook } from 'lucide-react'

function ZaloIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
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
    color: '#16A34A',
    icon: Phone,
  },
  {
    id: 'zalo',
    label: 'Zalo',
    sublabel: 'Chat ngay',
    href: 'https://zalo.me/0967611112',
    color: '#0068FF',
    icon: ZaloIcon,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    sublabel: 'Nhắn tin',
    href: 'https://m.me/Camera247Hue',
    color: '#1877F2',
    icon: Facebook,
  },
]

export default function FloatingContact() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 sm:right-5 z-40 flex flex-col items-end gap-2.5">
      {open && (
        <div className="flex flex-col items-end gap-2">
          {contacts.map((c, i) => (
            <a
              key={c.id}
              href={c.href}
              target={c.id !== 'phone' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-2.5"
              style={{ animation: `slideInRight 0.3s ease ${i * 0.05}s both` }}
            >
              <div className="rounded-xl bg-white border border-brand-border shadow-soft px-3 py-2 text-right max-w-[11rem]">
                <div className="text-brand-navy text-xs font-semibold">{c.label}</div>
                <div className="text-brand-muted text-xs">{c.sublabel}</div>
              </div>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-soft active:scale-95 transition-transform"
                style={{ backgroundColor: c.color }}
              >
                <c.icon className="w-5 h-5 text-white" />
              </div>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-yellow flex items-center justify-center shadow-lift active:scale-95 transition-transform"
        aria-label={open ? 'Đóng liên hệ nhanh' : 'Mở liên hệ nhanh'}
      >
        {open ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-brand-navy" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-brand-navy" />}
      </button>
    </div>
  )
}
