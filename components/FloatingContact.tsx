'use client'

import { useState } from 'react'
import { MessageCircle, Phone, X, Facebook } from 'lucide-react'

// Zalo SVG icon
function ZaloIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.49 10.272v-.45h2.403c.275 0 .449.172.449.45v4.95c0 .277-.174.45-.45.45h-.45v-4.95H12.49zM7.61 10.274a.45.45 0 0 0-.45.45v4.95h.9v-1.8h1.35c.276 0 .45-.173.45-.45v-2.7c0-.277-.174-.45-.45-.45H7.61zm1.35 2.7H8.06v-1.8h.9v1.8zm10.538-2.7h-2.7c-.276 0-.45.173-.45.45v4.95h.9v-4.5h.45v4.5h.9v-4.5h.45v4.5h.9v-4.95c0-.277-.174-.45-.45-.45zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}

const contacts = [
  {
    id: 'phone',
    label: 'Gọi Điện',
    sublabel: '0967 611 112',
    href: 'tel:0967611112',
    color: '#22c55e',
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      
      {/* Contact options */}
      {open && (
        <div className="flex flex-col items-end gap-2">
          {contacts.map((c, i) => (
            <a
              key={c.id}
              href={c.href}
              target={c.id !== 'phone' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
              style={{
                animation: `slideInRight 0.3s ease ${i * 0.05}s both`,
              }}
            >
              {/* Label */}
              <div className="bg-[#1A1A1A] border border-gray-700 rounded-xl px-3 py-2 text-right shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-white text-xs font-bold">{c.label}</div>
                <div className="text-gray-400 text-xs">{c.sublabel}</div>
              </div>

              {/* Button */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer relative"
                style={{ backgroundColor: c.color }}
              >
                <c.icon className="w-5 h-5 text-white" />
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: c.color }}
                />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#F5C518] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all relative"
        style={{ boxShadow: '0 0 0 0 rgba(245,197,24,0.4)' }}
      >
        {/* Pulse rings */}
        {!open && (
          <>
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#F5C518] opacity-30 animate-ping" />
          </>
        )}
        {open ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <MessageCircle className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Label */}
      {!open && (
        <div className="text-center text-xs text-gray-400 mt-1">
          Liên hệ
        </div>
      )}
    </div>
  )
}
