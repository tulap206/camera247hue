"use client"

import { useState } from "react"
import { MessageCircle, Phone, X, Facebook } from "lucide-react"
import { cn } from "@/lib/utils"

function ZaloIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M12.49 10.272v-.45h2.403c.275 0 .449.172.449.45v4.95c0 .277-.174.45-.45.45h-.45v-4.95H12.49zM7.61 10.274a.45.45 0 0 0-.45.45v4.95h.9v-1.8h1.35c.276 0 .45-.173.45-.45v-2.7c0-.277-.174-.45-.45-.45H7.61zm1.35 2.7H8.06v-1.8h.9v1.8zm10.538-2.7h-2.7c-.276 0-.45.173-.45.45v4.95h.9v-4.5h.45v4.5h.9v-4.5h.45v4.5h.9v-4.95c0-.277-.174-.45-.45-.45zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}

const contacts = [
  {
    id: "phone",
    label: "Gọi điện",
    sublabel: "0967 611 112",
    href: "tel:0967611112",
    color: "#22c55e",
    icon: Phone,
  },
  {
    id: "zalo",
    label: "Zalo",
    sublabel: "Chat ngay",
    href: "https://zalo.me/0967611112",
    color: "#0068FF",
    icon: ZaloIcon,
  },
  {
    id: "facebook",
    label: "Facebook",
    sublabel: "Nhắn tin",
    href: "https://m.me/Camera247Hue",
    color: "#1877F2",
    icon: Facebook,
  },
]

export default function FloatingContact() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="mb-1 flex flex-col items-end gap-2.5">
          {contacts.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target={c.id !== "phone" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition-transform hover:scale-[1.02]"
            >
              <span className="rounded-xl border border-white/10 bg-[#111115]/95 px-3 py-2 text-right text-xs shadow-xl backdrop-blur">
                <span className="block font-bold text-white">{c.label}</span>
                <span className="text-[10px] text-[#F5C518]">{c.sublabel}</span>
              </span>
              <span
                className="flex size-12 items-center justify-center rounded-full text-white shadow-xl"
                style={{ backgroundColor: c.color }}
              >
                <c.icon className="size-5" />
              </span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Liên hệ"
        className={cn(
          "relative flex size-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95",
          open ? "bg-zinc-800 text-white" : "bg-[#F5C518] text-black"
        )}
      >
        {open ? <X className="size-5" strokeWidth={2.5} /> : <MessageCircle className="size-5" strokeWidth={2.5} />}
      </button>
    </div>
  )
}
