'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Shield,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Camera,
  Check,
  AlertCircle,
  PhoneCall,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type AdminTab = 'overview' | 'customers' | 'orders' | 'posts' | 'access-history' | 'settings'

interface AdminSidebarProps {
  currentTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  onLogout: () => void
  counts?: {
    customers: number
    orders: number
    inProgressOrders: number
    posts: number
    unreadContacts?: number
  }
}

const MENU_ITEMS = [
  { id: 'overview' as AdminTab, label: 'Tổng quan', icon: LayoutDashboard, badge: null },
  { id: 'customers' as AdminTab, label: 'Khách hàng', icon: Users, badgeKey: 'customers' },
  { id: 'orders' as AdminTab, label: 'Đơn hàng', icon: ClipboardList, badgeKey: 'inProgressOrders' },
  { id: 'posts' as AdminTab, label: 'Bài viết', icon: FileText, badgeKey: 'posts' },
  { id: 'access-history' as AdminTab, label: 'Lịch sử truy cập', icon: History, badge: null },
  { id: 'settings' as AdminTab, label: 'Cài đặt sao lưu', icon: Settings, badge: null },
]

export function AdminSidebar({
  currentTab,
  onTabChange,
  onLogout,
  counts = { customers: 0, orders: 0, inProgressOrders: 0, posts: 0 },
}: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<'admin' | 'admin1'>('admin')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Password change state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các trường.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới không khớp.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword, username: adminUser }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
        setTimeout(() => {
          setOldPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setPasswordMessage(null)
          setIsProfileOpen(false)
        }, 1500)
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Đổi mật khẩu thất bại. Kiểm tra mật khẩu cũ.' })
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Lỗi kết nối máy chủ.' })
    } finally {
      setChangingPassword(false)
    }
  }

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-[4.5rem] px-5 border-b border-slate-800/80 shrink-0 bg-[#070A0F]">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C518] to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
          <Shield className="w-5 h-5 text-black" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-slate-100 tracking-tight leading-tight truncate">
            Camera 247 Huế
          </p>
          <p className="text-[11px] text-yellow-400/90 font-medium tracking-wide truncate mt-0.5">
            An Ninh & Giám Sát 24/7
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
          Bảng Điều Khiển
        </div>

        {MENU_ITEMS.map((item) => {
          const active = currentTab === item.id
          const Icon = item.icon
          const badgeVal = item.badgeKey ? (counts as any)[item.badgeKey] : null

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onTabChange(item.id)
                setMobileOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-3 h-11 px-3.5 rounded-xl transition-all duration-200 text-[13.5px] font-medium group text-left relative',
                active
                  ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/25 border border-blue-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              )}
            >
              <Icon
                className={cn(
                  'w-[19px] h-[19px] shrink-0 transition-transform duration-200 group-hover:scale-110',
                  active ? 'text-white' : 'text-slate-400 group-hover:text-yellow-400'
                )}
              />
              <span className="truncate flex-1">{item.label}</span>

              {badgeVal !== null && badgeVal !== undefined && badgeVal > 0 && (
                <span
                  className={cn(
                    'text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums shrink-0',
                    active
                      ? 'bg-white/20 text-white border border-white/30'
                      : item.id === 'orders' && counts.inProgressOrders > 0
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  )}
                >
                  {badgeVal}
                </span>
              )}
            </button>
          )
        })}

        <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
          Truy Cập Nhanh
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 h-10 px-3.5 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-slate-800/40 hover:text-yellow-400 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          <span className="truncate">Xem Landing Page</span>
        </a>
      </nav>

      {/* Footer Profile & Brand info */}
      <div className="mt-auto border-t border-slate-800/80 p-3 space-y-2 shrink-0 bg-[#070A0F]">
        {/* User Card */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-all text-left border border-slate-800/50 group"
        >
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-blue-500/30 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <span>247</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-yellow-400 transition-colors">
              Ban Quản Trị C247
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              Kỹ thuật & Giám sát
            </p>
          </div>
          <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:rotate-45 shrink-0" />
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-lg text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất hệ thống</span>
        </button>

        {/* Version info */}
        <div className="pt-2 border-t border-slate-800/50 text-center select-none">
          <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
            CAMERA 247 HUẾ · v2.5
          </p>
          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
            MST: 3301677400 · TP. Huế
          </p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Fixed Aside / Mobile Slide-in */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-[100dvh] w-[16.5rem] bg-[#0A0D14] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sticky Header Bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between min-h-14 px-4 bg-[#0A0D14]/95 backdrop-blur-md border-b border-slate-800/80 text-white shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-white truncate">
              Camera 247 Huế
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
            title="Tài khoản"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              247
            </div>
          </button>
        </div>
      </div>

      {/* Profile & Change Password Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121620] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E121A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Thông Tin Quản Trị Viên</h3>
                  <p className="text-[11px] text-slate-400">Hệ thống Camera 247 Huế</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  setPasswordMessage(null)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Account summary with avatar pick */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden border border-blue-400/40">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>247</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Công Ty TNHH CN An Ninh Huế</p>
                  <p className="text-xs text-yellow-400 font-mono mt-0.5">Tài khoản: admin / admin1</p>
                  <p className="text-[11px] text-slate-400 mt-1">Hotline: 0796 785 151 · 0967 611 112</p>
                </div>
              </div>

              {/* Change password form */}
              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Đổi Mật Khẩu Quản Trị
                </p>

                {passwordMessage && (
                  <div
                    className={cn(
                      'p-3 rounded-xl text-xs flex items-center gap-2',
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                    )}
                  >
                    {passwordMessage.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang dùng"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nhập lại mật khẩu</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận lại"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {changingPassword ? 'Đang lưu...' : 'Cập Nhật Mật Khẩu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-medium border border-slate-700"
                  >
                    Đóng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
