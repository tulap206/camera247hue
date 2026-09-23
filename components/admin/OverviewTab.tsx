'use client'

import { useMemo, useState } from 'react'
import {
  DollarSign,
  ClipboardList,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  Calendar,
  Clock,
  ArrowUpRight,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Camera,
  Lock,
  Wifi,
  Bell,
  Fingerprint,
  ChevronRight,
  Sparkles,
  Printer,
  MessageSquare,
  Phone,
  Check,
  Trash2,
  ExternalLink,
  X,
  Send,
} from 'lucide-react'
import { formatVND, formatNumber } from '@/lib/formatters'
import type { Customer, InstallationOrder, AccessLog } from '@/lib/camera247-data'
import { CAMERA247_SERVICES, ORDER_STATUS_CONFIG } from '@/lib/camera247-data'
import type { AdminTab } from './AdminSidebar'
import type { Post, ContactMessage } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const SERVICE_STYLE_MAP: Record<string, { dotBg: string; barBg: string }> = {
  camera: { dotBg: 'bg-[#0071E3]', barBg: 'bg-[#0071E3]' },
  smart_lock: { dotBg: 'bg-amber-500', barBg: 'bg-amber-500' },
  wifi: { dotBg: 'bg-emerald-500', barBg: 'bg-emerald-500' },
  alarm: { dotBg: 'bg-rose-500', barBg: 'bg-rose-500' },
  time_attendance: { dotBg: 'bg-purple-500', barBg: 'bg-purple-500' },
  it_network: { dotBg: 'bg-cyan-500', barBg: 'bg-cyan-500' },
}

function parseOrderDate(dateStr?: string, fallbackIso?: string): Date | null {
  if (dateStr) {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day)
      }
    }
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d
  }
  if (fallbackIso) {
    const d = new Date(fallbackIso)
    if (!isNaN(d.getTime())) return d
  }
  return null
}

interface OverviewTabProps {
  orders: InstallationOrder[]
  customers: Customer[]
  posts: Post[]
  logs: AccessLog[]
  contacts?: ContactMessage[]
  onNavigateTab: (tab: AdminTab) => void
  onOpenNewOrder: () => void
  onOpenNewCustomer: () => void
  onOpenNewPost: () => void
  onToggleReadContact?: (id: string, read: boolean) => void
  onDeleteContact?: (id: string) => void
  onConvertContactToCustomer?: (contact: ContactMessage) => void
  onConvertContactToOrder?: (contact: ContactMessage) => void
}

export function OverviewTab({
  orders,
  customers,
  posts,
  logs,
  contacts = [],
  onNavigateTab,
  onOpenNewOrder,
  onOpenNewCustomer,
  onOpenNewPost,
  onToggleReadContact,
  onDeleteContact,
  onConvertContactToCustomer,
  onConvertContactToOrder,
}: OverviewTabProps) {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Compute Key Performance Indicators
  const stats = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'warranty')
    const inProgressOrders = orders.filter((o) => o.status === 'in_progress')
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'survey')
    const warrantyOrders = orders.filter((o) => o.status === 'warranty')

    const totalRevenue = orders.reduce((sum, o) => {
      if (o.status !== 'cancelled') return sum + (o.total_amount || 0)
      return sum
    }, 0)
    const totalDeposited = orders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0)
    const unreadLeadsCount = contacts.filter((c) => !c.read).length

    return {
      totalRevenue,
      totalDeposited,
      totalOrders: orders.length,
      inProgressCount: inProgressOrders.length,
      pendingCount: pendingOrders.length,
      warrantyCount: warrantyOrders.length,
      customerCount: customers.length,
      postCount: posts.length,
      unreadLeadsCount,
    }
  }, [orders, customers, posts, contacts])

  // 12-Month Revenue Breakdown (Apple Screen Time / Health style)
  const { monthlyData, q1Revenue } = useMemo(() => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]
    const revenueMap: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0
    }

    orders.forEach((o) => {
      if (o.status !== 'cancelled') {
        const d = parseOrderDate(o.installation_date, o.created_at)
        if (d && !isNaN(d.getTime())) {
          const m = d.getMonth()
          if (m >= 0 && m <= 11) {
            revenueMap[m] = (revenueMap[m] || 0) + (o.total_amount || 0)
          }
        }
      }
    })

    const max = Math.max(...Object.values(revenueMap), 1)
    const mData = months.map((m, idx) => ({
      name: m,
      short: `T${idx + 1}`,
      value: revenueMap[idx] || 0,
      percent: Math.round(((revenueMap[idx] || 0) / max) * 100),
    }))

    const q1 = (revenueMap[0] || 0) + (revenueMap[1] || 0) + (revenueMap[2] || 0)

    return { monthlyData: mData, q1Revenue: q1 }
  }, [orders])

  // Services distribution
  const serviceDistribution = useMemo(() => {
    const countMap: Record<string, number> = {
      camera: 0,
      smart_lock: 0,
      wifi: 0,
      alarm: 0,
      time_attendance: 0,
      it_network: 0,
    }

    orders.forEach((o) => {
      (o.services || []).forEach((s) => {
        if (countMap[s] !== undefined) countMap[s]++
      })
    })

    const total = Object.values(countMap).reduce((a, b) => a + b, 0) || 1

    return CAMERA247_SERVICES.map((s) => ({
      ...s,
      count: countMap[s.id] || 0,
      percent: Math.round(((countMap[s.id] || 0) / total) * 100),
    }))
  }, [orders])

  // Top service calculated dynamically
  const topService = useMemo(() => {
    const sorted = [...serviceDistribution].sort((a, b) => b.count - a.count)
    return sorted[0]
  }, [serviceDistribution])

  // Upcoming installations (orders in progress or pending, or recent warranty/completed if none upcoming)
  const displayOrders = useMemo(() => {
    const upcoming = orders.filter((o) => o.status === 'in_progress' || o.status === 'pending' || o.status === 'survey')
    if (upcoming.length > 0) {
      return { list: upcoming.slice(0, 5), isUpcoming: true }
    }
    return { list: orders.slice(0, 5), isUpcoming: false }
  }, [orders])

  return (
    <div className="space-y-6 pb-12">
      {/* Apple Greeting Hero Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 sm:p-7 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0071E3] text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            Trung Tâm Điều Hành Camera 247 Huế
          </div>
          <h1 className="text-xl sm:text-[26px] lg:text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-snug">
            Tổng Quan Quản Lý & Thi Công
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#86868B] mt-1 max-w-xl leading-relaxed">
            Giám sát các dự án camera an ninh, khóa điện tử, hạ tầng mạng và chăm sóc khách hàng tại Huế.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 relative z-10 shrink-0 w-full sm:w-auto">
          <button
            onClick={onOpenNewOrder}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_10px_rgba(0,113,227,0.28)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Tạo Đơn Mới
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-3.5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm border border-slate-200/80 transition-all active:scale-[0.98]"
          >
            <Users className="w-4 h-4 text-[#86868B]" /> Thêm Khách
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1D1D1F] px-3.5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm border border-slate-200/80 shadow-2xs transition-all active:scale-[0.98]"
            title="In Báo Cáo A4"
          >
            <Printer className="w-4 h-4 text-[#0071E3]" /> In Báo Cáo A4
          </button>
        </div>
      </div>

      {/* Apple KPI 4 Cards Grid - Responsive 2x2 on Mobile, 4 Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#86868B] uppercase tracking-wider truncate">
              Tổng Giá Trị Thi Công
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl lg:text-[24px] font-bold text-[#1D1D1F] tracking-tight font-tabular truncate">
              {formatVND(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[10.5px] sm:text-xs text-slate-500 mt-1 font-medium truncate">
              {stats.totalRevenue > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Đã hoàn thành bàn giao
                </span>
              ) : (
                <span>Chờ cập nhật từ đơn hàng</span>
              )}
            </div>
          </div>
        </div>

        {/* In progress orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#86868B] uppercase tracking-wider truncate">
              Đang Thi Công
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl lg:text-[24px] font-bold text-[#0071E3] tracking-tight font-tabular">
              {stats.inProgressCount} <span className="text-xs sm:text-sm font-normal text-[#86868B]">công trình</span>
            </div>
            <div className="text-[10.5px] sm:text-xs text-[#86868B] mt-1 font-medium truncate">
              + {stats.pendingCount} đơn chờ khảo sát
            </div>
          </div>
        </div>

        {/* Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#86868B] uppercase tracking-wider truncate">
              Hồ Sơ Khách Hàng
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl lg:text-[24px] font-bold text-[#1D1D1F] tracking-tight font-tabular">
              {stats.customerCount} <span className="text-xs sm:text-sm font-normal text-[#86868B]">khách hàng</span>
            </div>
            <div className="text-[10.5px] sm:text-xs text-amber-600 mt-1 font-medium truncate">
              Gia đình & doanh nghiệp
            </div>
          </div>
        </div>

        {/* Active Warranties */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#86868B] uppercase tracking-wider truncate">
              Đang Bảo Hành
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl lg:text-[24px] font-bold text-purple-600 tracking-tight font-tabular">
              {stats.warrantyCount} <span className="text-xs sm:text-sm font-normal text-[#86868B]">hệ thống</span>
            </div>
            <div className="text-[10.5px] sm:text-xs text-[#86868B] mt-1 font-medium truncate">
              Bảo hành 12 - 24 tháng
            </div>
          </div>
        </div>
      </div>

      {/* Leads Action Center (Yêu Cầu Tư Vấn Mới Từ Landing Page) */}
      {contacts.length > 0 ? (
        <div className="bg-white border border-amber-200/90 rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(245,197,24,0.08)] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    Yêu Cầu Tư Vấn & Khảo Sát Từ Website
                  </h3>
                  {stats.unreadLeadsCount > 0 && (
                    <span className="text-[11px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      {stats.unreadLeadsCount} mới
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Khách hàng điền biểu mẫu tư vấn trực tiếp từ trang chủ
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {contacts.slice(0, 6).map((lead) => (
              <div
                key={lead.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  !lead.read
                    ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[#1D1D1F] truncate">
                      {lead.name}
                    </span>
                    <span className="text-[10px] text-[#86868B] font-mono shrink-0">
                      {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-xs font-mono font-bold text-[#0071E3] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </a>
                    <span className="text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {lead.service || 'Khảo sát camera'}
                    </span>
                  </div>

                  {lead.message && (
                    <p className="text-xs text-[#6E6E73] line-clamp-2 bg-white/80 p-2 rounded-xl border border-slate-200/60 mb-3">
                      &quot;{lead.message}&quot;
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onConvertContactToOrder && onConvertContactToOrder(lead)}
                      className="text-[11px] font-bold text-[#0071E3] hover:bg-blue-100/60 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                      title="Tạo đơn thi công ngay"
                    >
                      <Plus className="w-3 h-3" /> Tạo Đơn
                    </button>
                    <button
                      onClick={() => onConvertContactToCustomer && onConvertContactToCustomer(lead)}
                      className="text-[11px] font-bold text-emerald-700 hover:bg-emerald-100/60 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                      title="Lưu vào danh bạ khách hàng"
                    >
                      <Users className="w-3 h-3" /> Lưu Khách
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {onToggleReadContact && (
                      <button
                        onClick={() => onToggleReadContact(lead.id, !lead.read)}
                        className="text-[10.5px] font-medium text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-white"
                        title={lead.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                      >
                        <Check className={`w-3.5 h-3.5 ${lead.read ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </button>
                    )}
                    {onDeleteContact && (
                      <button
                        onClick={() => onDeleteContact(lead.id)}
                        className="text-[10.5px] font-medium text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                        title="Xóa tin nhắn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 text-[#0071E3] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F]">
                Yêu Cầu Tư Vấn & Khảo Sát Từ Website
              </h3>
              <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5">
                Chưa có yêu cầu mới nào từ form liên hệ trang chủ · Sẵn sàng tiếp nhận tự động.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
            <Check className="w-3 h-3" /> Đang hoạt động
          </span>
        </div>
      )}

      {/* Apple Charts & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 12-Month Revenue Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0071E3]" />
                Doanh Thu Thi Công Năm 2026
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Doanh số lắp đặt camera, khóa cửa và mạng wifi theo tháng
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start">
              {stats.totalRevenue > 0 ? `Tổng: ${formatVND(stats.totalRevenue)}` : 'Dữ liệu thời gian thực'}
            </div>
          </div>

          {/* Clean Apple Bar Chart */}
          <div className="h-52 sm:h-56 flex items-end gap-1 sm:gap-3 pt-6 pb-2 px-1 border-b border-slate-100">
            {monthlyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1D1D1F] text-white text-[11px] font-medium px-2.5 py-1 rounded-xl pointer-events-none whitespace-nowrap z-20 shadow-xl">
                  {item.name}: {formatVND(item.value)}
                </div>

                <div className="w-full bg-slate-100/70 rounded-t-xl relative flex items-end justify-center overflow-hidden h-full max-w-[34px]">
                  <div
                    style={{ height: `${item.value > 0 ? Math.max(item.percent, 8) : 0}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      item.value > 0
                        ? 'bg-gradient-to-t from-[#0071E3] to-[#47A1FF] group-hover:brightness-110 shadow-xs'
                        : 'bg-transparent'
                    }`}
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#86868B] mt-2 group-hover:text-[#1D1D1F]">
                  {item.short}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#86868B] mt-4 pt-1">
            <span>Tổng quý 1/2026: <strong className="text-[#1D1D1F]">{formatVND(q1Revenue)}</strong></span>
            <span className="text-[11px] text-[#0071E3] font-semibold">
              {stats.totalRevenue > 0 ? 'Camera 247 Huế · Hoàn thành bàn giao' : 'Camera 247 Huế · Cập nhật theo giá trị đơn hàng thực tế'}
            </span>
          </div>
        </div>

        {/* Services Distribution */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#0071E3]" />
              Cơ Cấu Dịch Vụ
            </h3>
            <p className="text-xs text-[#86868B] mb-5">
              Phân bố các gói dịch vụ khách hàng lựa chọn
            </p>

            <div className="space-y-3.5">
              {serviceDistribution.map((serv) => {
                const styles = SERVICE_STYLE_MAP[serv.id] || { dotBg: 'bg-[#0071E3]', barBg: 'bg-[#0071E3]' }
                return (
                  <div key={serv.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#1D1D1F] flex items-center gap-2 truncate">
                        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', styles.dotBg)} />
                        {serv.name}
                      </span>
                      <span className="text-[#86868B] shrink-0 font-semibold font-tabular">
                        {serv.count} đơn ({serv.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', styles.barBg)}
                        style={{ width: serv.count > 0 ? `${Math.max(serv.percent, 4)}%` : '0%' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#86868B]">Dịch vụ chủ lực:</span>
            <span className="font-bold text-[#0071E3]">
              {topService && topService.count > 0 ? `${topService.name} (${topService.percent}%)` : 'Camera Quan Sát / AI'}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Orders & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Installation schedule / Recent projects */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0071E3]" />
                {displayOrders.isUpcoming ? 'Lịch Khảo Sát & Thi Công Gần Nhất' : 'Công Trình Đang Quản Lý & Bảo Hành'}
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                {displayOrders.isUpcoming
                  ? 'Các công trình đang triển khai và chuẩn bị thi công tại Huế'
                  : 'Hệ thống thiết bị an ninh đã bàn giao tại Thừa Thiên Huế'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#0071E3] hover:text-[#0077ED] font-semibold flex items-center gap-1 shrink-0"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {displayOrders.list.length === 0 ? (
              <div className="py-8 text-center text-[#86868B] text-xs">
                Chưa có dữ liệu đơn hàng.
              </div>
            ) : (
              displayOrders.list.map((order) => {
                const statusInfo = ORDER_STATUS_CONFIG[order.status] || { label: order.status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' }
                return (
                  <div
                    key={order.id}
                    onClick={() => onNavigateTab('orders')}
                    className="p-3.5 sm:p-4 bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/60 hover:border-blue-200 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-[#0071E3]">
                          {order.order_code}
                        </span>
                        <span className="font-semibold text-[#1D1D1F] text-xs truncate max-w-[220px]">
                          {order.customer_name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#86868B] truncate">
                        📍 {order.customer_address || 'TP. Huế'}
                      </p>
                      <p className="text-[11px] text-[#6E6E73] mt-0.5 truncate">
                        ⚙️ {order.equipment_list}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 flex sm:flex-col items-center sm:items-end justify-between">
                      <div className="font-bold text-xs text-[#1D1D1F] font-tabular">
                        {order.total_amount > 0 ? formatVND(order.total_amount) : 'Chưa định giá'}
                      </div>
                      <div className="text-[11px] text-[#86868B] sm:mt-0.5">
                        {order.installation_date ? `Ngày: ${order.installation_date}` : 'Chưa định ngày'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Audit & Activity Log */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0071E3]" />
                Hoạt Động Quản Trị
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Nhật ký thao tác hệ thống thời gian thực
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('access-history')}
              className="text-xs text-[#0071E3] hover:text-[#0077ED] font-semibold flex items-center gap-1 shrink-0"
            >
              Xem đầy đủ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0071E3] border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#1D1D1F] truncate">
                      {log.displayName || log.username}
                    </span>
                    <span className="text-[10.5px] text-[#86868B] font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#6E6E73] mt-0.5 leading-relaxed line-clamp-2">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* A4 Executive Report Print Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal action bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0071E3]" />
                <h3 className="font-bold text-sm text-[#1D1D1F]">
                  Xem Trước Bản In Báo Cáo Hoạt Động (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#0071E3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> In Báo Cáo
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A4 Printable Sheet Content */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-black bg-white font-sans">
              {/* Company Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                  <h2 className="font-black text-lg tracking-tight uppercase">
                    CÔNG TY TNHH CÔNG NGHỆ AN NINH HUẾ
                  </h2>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    Thương hiệu: Camera 247 Huế · MST: 3301677400
                  </p>
                  <p className="text-xs text-slate-600">
                    Trụ sở: 40 Tùng Thiện Vương, Phường Vỹ Dạ, TP. Huế
                  </p>
                  <p className="text-xs text-slate-600">
                    Hotline Kỹ thuật: 0796 785 151 (Tước) · 0967 611 112 (Lập)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    MÃ BÁO CÁO: BC-2026-Q1
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Ngày xuất: {new Date().toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6">
                <h1 className="text-xl font-black uppercase tracking-wide">
                  BÁO CÁO TỔNG KẾT HOẠT ĐỘNG THI CÔNG & KINH DOANH
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Kỳ báo cáo: Quý 1 Năm 2026 · TP. Huế
                </p>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Tổng Doanh Số</div>
                  <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                    {formatVND(stats.totalRevenue)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Khách Hàng</div>
                  <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                    {stats.customerCount}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Đang Thi Công</div>
                  <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                    {stats.inProgressCount} đơn
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Đang Bảo Hành</div>
                  <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                    {stats.warrantyCount} đơn
                  </div>
                </div>
              </div>

              {/* Section 1: Top upcoming projects */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b pb-1">
                  1. Danh Sách Công Trình Đang Triển Khai & Khảo Sát
                </h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-2 text-center w-10">STT</th>
                      <th className="border border-slate-300 p-2 text-left">Mã Đơn</th>
                      <th className="border border-slate-300 p-2 text-left">Khách Hàng</th>
                      <th className="border border-slate-300 p-2 text-left">Địa Chỉ</th>
                      <th className="border border-slate-300 p-2 text-left">Hạng Mục Thiết Bị</th>
                      <th className="border border-slate-300 p-2 text-right">Trị Giá</th>
                      <th className="border border-slate-300 p-2 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o, idx) => (
                      <tr key={o.id}>
                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-mono font-bold">{o.order_code}</td>
                        <td className="border border-slate-300 p-2 font-semibold">{o.customer_name}</td>
                        <td className="border border-slate-300 p-2">{o.customer_address}</td>
                        <td className="border border-slate-300 p-2">{o.equipment_list}</td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-semibold">
                          {formatVND(o.total_amount)}
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {o.status === 'completed'
                            ? 'Đã bàn giao'
                            : o.status === 'warranty'
                            ? 'Đang bảo hành'
                            : o.status === 'in_progress'
                            ? 'Đang thi công'
                            : o.status === 'pending'
                            ? 'Chờ thi công'
                            : o.status === 'survey'
                            ? 'Khảo sát / Báo giá'
                            : 'Đã hủy'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-slate-300 text-center">
                <div>
                  <div className="text-xs font-bold uppercase">QUẢN TRỊ VIÊN HỆ THỐNG</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký & ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="text-xs font-bold">Phan Lê Tự Lập</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase">GIÁM ĐỐC & KỸ THUẬT</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký & ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="text-xs font-bold">Phạm Bá Tước</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
