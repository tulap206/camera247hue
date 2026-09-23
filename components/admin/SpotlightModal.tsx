'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  X,
  Users,
  ClipboardList,
  FileText,
  MessageSquare,
  ArrowRight,
  Shield,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import type { Customer, InstallationOrder } from '@/lib/camera247-data'
import type { Post, ContactMessage } from '@/lib/supabase'
import type { AdminTab } from './AdminSidebar'
import { formatVND } from '@/lib/formatters'

interface SpotlightModalProps {
  isOpen: boolean
  onClose: () => void
  customers: Customer[]
  orders: InstallationOrder[]
  posts: Post[]
  contacts: ContactMessage[]
  onNavigateTab: (tab: AdminTab) => void
  onSelectCustomer?: (customer: Customer) => void
  onSelectOrder?: (order: InstallationOrder) => void
  onSelectPost?: (post: Post) => void
  onSelectContact?: (contact: ContactMessage) => void
}

export function SpotlightModal({
  isOpen,
  onClose,
  customers,
  orders,
  posts,
  contacts,
  onNavigateTab,
  onSelectCustomer,
  onSelectOrder,
  onSelectPost,
  onSelectContact,
}: SpotlightModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Global keydown for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return {
        customers: customers.slice(0, 3),
        orders: orders.slice(0, 3),
        posts: posts.slice(0, 2),
        contacts: contacts.filter((c) => !c.read).slice(0, 3),
        totalCount: 0,
      }
    }

    const matchedCustomers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    )

    const matchedOrders = orders.filter(
      (o) =>
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        o.customer_address.toLowerCase().includes(q) ||
        o.equipment_list.toLowerCase().includes(q)
    )

    const matchedPosts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.category && p.category.name.toLowerCase().includes(q))
    )

    const matchedContacts = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.message && c.message.toLowerCase().includes(q)) ||
        (c.service && c.service.toLowerCase().includes(q))
    )

    const totalCount =
      matchedCustomers.length +
      matchedOrders.length +
      matchedPosts.length +
      matchedContacts.length

    return {
      customers: matchedCustomers,
      orders: matchedOrders,
      posts: matchedPosts,
      contacts: matchedContacts,
      totalCount,
    }
  }, [query, customers, orders, posts, contacts])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200/80 bg-white">
          <Search className="w-5 h-5 text-[#0071E3] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm khách hàng, đơn hàng, SĐT, bài viết hoặc lead tư vấn..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1D1D1F] placeholder:text-[#86868B] font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            ESC để đóng
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Quick Lead Inquiries */}
          {results.contacts.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Yêu Cầu Tư Vấn Mới ({results.contacts.length})
                </span>
                <button
                  onClick={() => {
                    onNavigateTab('overview')
                    onClose()
                  }}
                  className="text-[11px] text-[#0071E3] hover:underline font-semibold"
                >
                  Xem tại Tổng quan
                </button>
              </div>

              <div className="space-y-1.5">
                {results.contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectContact) onSelectContact(c)
                      onNavigateTab('overview')
                      onClose()
                    }}
                    className="p-3 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1D1D1F]">{c.name}</span>
                        <span className="text-xs font-mono text-[#0071E3] font-semibold">
                          {c.phone}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800">
                          {c.service || 'Khảo sát camera'}
                        </span>
                      </div>
                      {c.message && (
                        <p className="text-[11px] text-[#6E6E73] truncate mt-0.5">
                          💬 {c.message}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Section */}
          {results.customers.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0071E3]" />
                  Khách Hàng ({results.customers.length})
                </span>
                <button
                  onClick={() => {
                    onNavigateTab('customers')
                    onClose()
                  }}
                  className="text-[11px] text-[#0071E3] hover:underline font-semibold"
                >
                  Tất cả khách hàng
                </button>
              </div>

              <div className="space-y-1.5">
                {results.customers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      if (onSelectCustomer) onSelectCustomer(cust)
                      onNavigateTab('customers')
                      onClose()
                    }}
                    className="p-3 bg-white hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1D1D1F]">{cust.name}</span>
                        <span className="text-xs font-mono text-[#0071E3]">{cust.phone}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            cust.tier === 'vip'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cust.type === 'business' ? 'Doanh nghiệp' : 'Cá nhân'}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#86868B] truncate mt-0.5">
                        📍 {cust.address}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0071E3] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {results.orders.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                  Đơn Hàng & Thi Công ({results.orders.length})
                </span>
                <button
                  onClick={() => {
                    onNavigateTab('orders')
                    onClose()
                  }}
                  className="text-[11px] text-[#0071E3] hover:underline font-semibold"
                >
                  Tất cả đơn hàng
                </button>
              </div>

              <div className="space-y-1.5">
                {results.orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      if (onSelectOrder) onSelectOrder(ord)
                      onNavigateTab('orders')
                      onClose()
                    }}
                    className="p-3 bg-white hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#0071E3]">
                          {ord.order_code}
                        </span>
                        <span className="text-xs font-bold text-[#1D1D1F] truncate">
                          {ord.customer_name}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 font-tabular">
                          {formatVND(ord.total_amount)}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#86868B] truncate mt-0.5">
                        ⚙️ {ord.equipment_list}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0071E3] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {results.posts.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Bài Viết Công Trình ({results.posts.length})
                </span>
                <button
                  onClick={() => {
                    onNavigateTab('posts')
                    onClose()
                  }}
                  className="text-[11px] text-[#0071E3] hover:underline font-semibold"
                >
                  Quản lý bài viết
                </button>
              </div>

              <div className="space-y-1.5">
                {results.posts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (onSelectPost) onSelectPost(p)
                      onNavigateTab('posts')
                      onClose()
                    }}
                    className="p-3 bg-white hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1D1D1F] truncate">{p.title}</p>
                      <p className="text-[11px] text-[#86868B] truncate mt-0.5">
                        {p.category?.name || 'Công trình an ninh'} ·{' '}
                        {p.published ? '✅ Đang hiển thị' : '🔒 Bản nháp'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0071E3] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query.trim() && results.totalCount === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Không tìm thấy kết quả</p>
              <p className="text-xs text-slate-400 mt-1">
                Không tìm thấy khách hàng, đơn hàng hay bài viết nào khớp với &quot;{query}&quot;.
              </p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-[#86868B]">
          <div className="flex items-center gap-3">
            <span>
              💡 Gợi ý: Gõ <strong>mã đơn (C247)</strong>, <strong>SĐT</strong>, hoặc <strong>tên khách</strong>
            </span>
          </div>
          <span className="font-medium">Spotlight · Camera 247 Huế</span>
        </div>
      </div>
    </div>
  )
}
