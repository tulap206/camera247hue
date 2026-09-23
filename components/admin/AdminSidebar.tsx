'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield,
  ShieldCheck,
  KeyRound,
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
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  CalendarCheck,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Building2,
  BadgeCheck,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type AdminTab = 'overview' | 'tasks' | 'customers' | 'orders' | 'posts' | 'access-history' | 'settings'

interface AdminSidebarProps {
  currentTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  onLogout: () => void
  onOpenSpotlight?: () => void
  activeUser?: 'admin' | 'admin1'
  activeDisplayName?: string
  counts?: {
    tasks?: number
    customers: number
    orders: number
    inProgressOrders: number
    posts: number
    unreadContacts?: number
  }
}

const MENU_ITEMS = [
  { id: 'overview' as AdminTab, label: 'Tổng quan', icon: LayoutDashboard, badgeKey: null },
  { id: 'tasks' as AdminTab, label: 'Nhắc việc', icon: CalendarCheck, badgeKey: 'tasks' },
  { id: 'customers' as AdminTab, label: 'Khách hàng', icon: Users, badgeKey: 'customers' },
  { id: 'orders' as AdminTab, label: 'Đơn hàng', icon: ClipboardList, badgeKey: 'orders' },
  { id: 'posts' as AdminTab, label: 'Bài viết', icon: FileText, badgeKey: 'posts' },
  { id: 'access-history' as AdminTab, label: 'Lịch sử truy cập', icon: History, badgeKey: null },
  { id: 'settings' as AdminTab, label: 'Cài đặt sao lưu', icon: Settings, badgeKey: null },
]

export function AdminSidebar({
  currentTab,
  onTabChange,
  onLogout,
  onOpenSpotlight,
  activeUser = 'admin',
  activeDisplayName = 'Quản trị viên (Lập)',
  counts = { customers: 0, orders: 0, inProgressOrders: 0, posts: 0, unreadContacts: 0 },
}: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<'admin' | 'admin1'>(activeUser)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setAdminUser(activeUser)
  }, [activeUser])

  // Password change state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      {/* macOS Window Controls & App Brand Header */}
      <div className="px-5 pt-4 pb-3 shrink-0 border-b border-slate-200/60">
        {/* Traffic Light Dots */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs inline-block" />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo/logo-diamond.png"
            alt="Camera 247 Huế"
            className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-bold text-[#1D1D1F] tracking-tight leading-tight truncate">
              Camera 247 Huế
            </p>
            <p className="text-[11px] text-[#86868B] font-medium tracking-normal truncate mt-0.5">
              Hệ Thống An Ninh & Giám Sát
            </p>
          </div>
        </div>
      </div>

      {/* macOS Style Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {/* Spotlight Search Quick Trigger */}
        <button
          type="button"
          onClick={() => {
            if (onOpenSpotlight) onOpenSpotlight()
            setMobileOpen(false)
          }}
          className="w-full mb-3 flex items-center justify-between h-9 px-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0071E3]/50 hover:bg-blue-50/30 text-left text-slate-500 hover:text-slate-900 transition-all group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0071E3]" />
            <span className="text-xs text-slate-500 group-hover:text-slate-800 font-medium truncate">
              Tìm nhanh...
            </span>
          </div>
          <kbd className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200/80 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        <div className="px-3 pt-1 pb-1.5 text-[11px] font-semibold text-[#86868B] tracking-wider uppercase select-none">
          Phân Hệ Quản Trị
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
                'w-full flex items-center gap-3 h-10 px-3 rounded-xl text-[13px] font-medium transition-all duration-150 text-left group relative',
                active
                  ? 'bg-[#0071E3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.28)] font-semibold'
                  : 'text-[#424245] hover:bg-slate-200/50 hover:text-[#1D1D1F]'
              )}
            >
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0 transition-transform duration-150 group-hover:scale-105',
                  active ? 'text-white' : 'text-[#86868B] group-hover:text-[#0071E3]'
                )}
              />
              <span className="truncate flex-1">{item.label}</span>

              {badgeVal !== null && badgeVal !== undefined && badgeVal > 0 && (
                <span
                  className={cn(
                    'text-[10.5px] font-semibold px-2 py-0.5 rounded-full tabular-nums shrink-0 transition-colors',
                    active
                      ? 'bg-white/20 text-white'
                      : item.id === 'orders' && counts.inProgressOrders > 0
                      ? 'bg-blue-100 text-[#0071E3] font-bold'
                      : 'bg-slate-200/70 text-[#6E6E73]'
                  )}
                >
                  {badgeVal}
                </span>
              )}
            </button>
          )
        })}

        <div className="pt-4 pb-1.5 px-3 text-[11px] font-semibold text-[#86868B] tracking-wider uppercase select-none">
          Phím Tắt
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 h-9 px-3 rounded-xl text-[12.5px] font-medium text-[#424245] hover:bg-slate-200/50 hover:text-[#0071E3] transition-colors group"
        >
          <ExternalLink className="w-4 h-4 text-[#86868B] group-hover:text-[#0071E3]" />
          <span className="truncate">Xem Landing Page</span>
        </a>
      </nav>

      {/* Apple Inset User Profile & Footer */}
      <div className="mt-auto border-t border-slate-200/60 p-3 space-y-2 shrink-0 bg-slate-50/50">
        {/* User Card */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="w-full flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-blue-300 hover:shadow-md transition-all text-left group"
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-blue-500/20 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <span>{adminUser === 'admin1' ? 'TƯỚC' : 'LẬP'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors">
              {activeDisplayName}
            </p>
            <p className="text-[10.5px] text-[#86868B] truncate">
              {adminUser === 'admin1' ? 'Hotline: 0796 785 151' : 'Hotline: 0967 611 112'}
            </p>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#0071E3] transition-transform group-hover:rotate-45 shrink-0" />
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 h-8 px-3 rounded-xl text-xs font-medium text-[#86868B] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất hệ thống</span>
        </button>

        {/* Apple Sub-footer: @ Camera 247 Huế - 2026 button */}
        <div className="pt-1.5 text-center select-none">
          <button
            type="button"
            onClick={() => setIsAboutModalOpen(true)}
            className="w-full py-1 text-center text-[11px] font-medium text-[#86868B] hover:text-[#0071E3] transition-colors rounded-lg hover:bg-slate-200/50 flex items-center justify-center gap-1 cursor-pointer group"
            title="Xem thông tin giới thiệu & liên hệ Camera 247 Huế"
          >
            <span className="group-hover:underline">@ Camera 247 Huế - 2026</span>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Fixed Aside / Mobile Slide-in (Light Frosted Apple Sidebar) */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-[100dvh] w-[16rem] bg-[#F8F9FA]/90 backdrop-blur-xl border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Top Header Bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between min-h-14 w-full px-4 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 text-[#1D1D1F] shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/images/logo/logo-diamond.png"
              alt="Camera 247 Huế"
              className="w-7 h-7 object-contain drop-shadow-2xs shrink-0"
            />
            <p className="text-sm font-bold text-[#1D1D1F] truncate">
              Camera 247 Huế
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSpotlight}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            title="Tìm kiếm nhanh (⌘K)"
            aria-label="Tìm kiếm"
          >
            <Search className="w-5 h-5 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="p-1 rounded-full hover:bg-slate-100"
            title="Tài khoản"
          >
            <div className="w-8 h-8 rounded-full bg-[#0071E3] flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              {adminUser === 'admin1' ? 'TƯỚC' : 'LẬP'}
            </div>
          </button>
        </div>
      </div>

      {/* Profile & Change Password Modal (iOS Sheet Style) */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F5F5F7]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">Thông Tin Quản Trị Viên</h3>
                  <p className="text-xs text-[#86868B]">Camera 247 Huế · Hệ Thống Điều Hành</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  setPasswordMessage(null)
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Account summary with avatar & status */}
              <div className="p-4 bg-[#F5F5F7]/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Bấm để đổi ảnh đại diện"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0071E3] to-blue-700 flex items-center justify-center text-white text-base font-bold overflow-hidden border-2 border-white shadow-xs">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>247</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
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
                    <p className="text-sm font-bold text-[#1D1D1F] truncate">
                      Công Ty TNHH CN An Ninh Huế
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {activeDisplayName || (adminUser === 'admin1' ? 'Quản trị viên (Tước)' : 'Quản trị viên (Lập)')}
                      </span>
                      <span className="text-[11px] text-[#86868B] font-medium">
                        ({adminUser === 'admin1' ? 'admin1' : 'admin'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hotlines with 1-click Call & Zalo */}
                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-[#86868B] flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[#1D1D1F]">Lập:</span>
                    <a href="tel:0967611112" className="text-[#0071E3] hover:underline font-medium">
                      0967 611 112
                    </a>
                    <a
                      href="https://zalo.me/0967611112"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                      title="Zalo Lập"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[#1D1D1F]">Tước:</span>
                    <a href="tel:0796785151" className="text-[#0071E3] hover:underline font-medium">
                      0796 785 151
                    </a>
                    <a
                      href="https://zalo.me/0796785151"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                      title="Zalo Tước"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Change password form */}
              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#0071E3]" />
                    Đổi Mật Khẩu Quản Trị
                  </p>
                  <span className="text-[11px] text-[#86868B]">Tối thiểu 6 ký tự</span>
                </div>

                {passwordMessage && (
                  <div
                    className={cn(
                      'p-3 rounded-2xl text-xs flex items-center gap-2 border transition-all',
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    )}
                  >
                    {passwordMessage.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                {/* Current password */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng"
                      className="w-full bg-[#F5F5F7] border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-9 pr-9 py-2.5 text-xs text-[#1D1D1F] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                      title={showOldPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New password & confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                      Mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mật khẩu mới"
                        className="w-full bg-[#F5F5F7] border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-9 pr-9 py-2.5 text-xs text-[#1D1D1F] transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                        title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                      Nhập lại mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận lại"
                        className="w-full bg-[#F5F5F7] border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-9 pr-9 py-2.5 text-xs text-[#1D1D1F] transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                        title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password match feedback */}
                {newPassword && confirmPassword && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-medium">
                        <Check className="w-3.5 h-3.5" /> Mật khẩu mới trùng khớp
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Mật khẩu nhập lại chưa khớp
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                      setPasswordMessage(null)
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-slate-200/80 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword || (Boolean(newPassword && confirmPassword) && newPassword !== confirmPassword)}
                    className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs py-2.5 rounded-2xl shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {changingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Company Introduction / About Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg shrink-0">
                  <img
                    src="/images/logo/logo-diamond.png"
                    alt="Logo Camera 247 Huế"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-1">
                    <BadgeCheck className="w-3 h-3 text-blue-400" /> Đơn Vị Hàng Đầu Tại Huế
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white truncate">
                    Camera 247 Huế
                  </h3>
                  <p className="text-xs text-slate-300 truncate">
                    Công ty TNHH Công Nghệ An Ninh Huế
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-[#1D1D1F]">
              {/* Showroom Storefront Hero Image from Landing Page */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs group">
                <img
                  src="/images/storefront-sign.jpg"
                  alt="Showroom Camera 247 Huế - 40 Tùng Thiện Vương"
                  className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[11px] font-semibold border border-white/20">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Showroom: 40 Tùng Thiện Vương, Vỹ Dạ, TP. Huế</span>
                  </span>
                </div>
              </div>

              {/* Introduction Text */}
              <div className="space-y-1.5 leading-relaxed text-[#424245]">
                <p>
                  <strong>Camera 247 Huế</strong> là đơn vị chuyên sâu trong lĩnh vực tư vấn, phân phối và thi công trọn gói hệ thống <strong>Camera giám sát an ninh thông minh AI</strong>, <strong>Khóa cửa điện tử vân tay / FaceID</strong>, <strong>Hạ tầng Wifi Mesh chuyên dụng</strong>, <strong>Máy chấm công</strong> và <strong>Báo động chống trộm</strong> trên toàn địa bàn TP. Huế và tỉnh Thừa Thiên Huế.
                </p>
              </div>

              {/* Core Services Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block">
                  Dịch Vụ Trọng Tâm Triển Khai
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-blue-950 text-[11.5px]">Camera AI Full Color</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold text-amber-950 text-[11.5px]">Khóa Vân Tay FaceID</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-950 text-[11.5px]">Wifi Mesh Chịu Tải</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-semibold text-purple-950 text-[11.5px]">Máy Chấm Công AI</span>
                  </div>
                </div>
              </div>

              {/* Company Info & Contact */}
              <div className="p-4 bg-[#F5F5F7]/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#86868B] text-[11px] block">Trụ sở & Showroom:</span>
                    <span className="font-semibold text-[#1D1D1F]">40 Tùng Thiện Vương, P. Vỹ Dạ, TP. Huế</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#86868B] text-[11px] block">Mã số thuế doanh nghiệp:</span>
                    <span className="font-mono font-bold text-[#1D1D1F]">3301677400 · Sở KH&ĐT TP. Huế</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#86868B] text-[11px] block">Hotline kỹ thuật & tư vấn 24/7:</span>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <a href="tel:0967611112" className="font-bold text-[#0071E3] hover:underline">
                        0967 611 112 (Mr. Lập)
                      </a>
                      <span className="text-slate-300">•</span>
                      <a href="tel:0796785151" className="font-bold text-[#0071E3] hover:underline">
                        0796 785 151 (Mr. Tước)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#86868B] text-[11px] block">Thư điện tử hỗ trợ:</span>
                    <span className="font-medium text-[#1D1D1F]">camera247hue@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-[#F5F5F7]/60 flex items-center justify-between gap-3 shrink-0">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-[#1D1D1F] hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Xem Landing Page</span>
              </a>

              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="px-6 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
