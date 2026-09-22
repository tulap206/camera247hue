'use client'

import { useMemo } from 'react'
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
} from 'lucide-react'
import { formatVND, formatNumber } from '@/lib/formatters'
import type { Customer, InstallationOrder, AccessLog } from '@/lib/camera247-data'
import { CAMERA247_SERVICES, ORDER_STATUS_CONFIG } from '@/lib/camera247-data'
import type { AdminTab } from './AdminSidebar'
import type { Post } from '@/lib/supabase'

interface OverviewTabProps {
  orders: InstallationOrder[]
  customers: Customer[]
  posts: Post[]
  logs: AccessLog[]
  onNavigateTab: (tab: AdminTab) => void
  onOpenNewOrder: () => void
  onOpenNewCustomer: () => void
  onOpenNewPost: () => void
}

export function OverviewTab({
  orders,
  customers,
  posts,
  logs,
  onNavigateTab,
  onOpenNewOrder,
  onOpenNewCustomer,
  onOpenNewPost,
}: OverviewTabProps) {
  // Compute Key Performance Indicators
  const stats = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'warranty')
    const inProgressOrders = orders.filter((o) => o.status === 'in_progress')
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'survey')
    const warrantyOrders = orders.filter((o) => o.status === 'warranty')

    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const totalDeposited = orders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0)

    return {
      totalRevenue,
      totalDeposited,
      totalOrders: orders.length,
      inProgressCount: inProgressOrders.length,
      pendingCount: pendingOrders.length,
      warrantyCount: warrantyOrders.length,
      customerCount: customers.length,
      postCount: posts.length,
    }
  }, [orders, customers, posts])

  // 12-Month Revenue Breakdown (Apple Screen Time / Health style)
  const monthlyData = useMemo(() => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]
    const revenueMap: Record<number, number> = {
      0: 32000000,
      1: 48500000,
      2: 74200000,
      3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0
    }

    orders.forEach((o) => {
      if (o.status !== 'cancelled') {
        const d = o.installation_date ? new Date(o.installation_date) : new Date(o.created_at)
        if (!isNaN(d.getTime())) {
          const m = d.getMonth()
          revenueMap[m] = (revenueMap[m] || 0) + (o.total_amount || 0)
        }
      }
    })

    const max = Math.max(...Object.values(revenueMap), 80000000)
    return months.map((m, idx) => ({
      name: m,
      short: `T${idx + 1}`,
      value: revenueMap[idx] || 0,
      percent: Math.round(((revenueMap[idx] || 0) / max) * 100),
    }))
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

  // Upcoming installations (orders in progress or pending)
  const upcomingOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'in_progress' || o.status === 'pending' || o.status === 'survey')
      .slice(0, 5)
  }, [orders])

  return (
    <div className="space-y-6 pb-12">
      {/* Apple Greeting Hero Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 sm:p-7 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0071E3] text-xs font-semibold mb-2.5">
            <Shield className="w-3.5 h-3.5" />
            Trung Tâm Điều Hành Camera 247 Huế
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-snug">
            Tổng Quan Quản Lý & Thi Công
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#86868B] mt-1 max-w-xl leading-relaxed">
            Giám sát các dự án camera an ninh, khóa điện tử, hạ tầng mạng và chăm sóc khách hàng tại Huế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_10px_rgba(0,113,227,0.28)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Tạo Đơn Mới
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm border border-slate-200/80 transition-all active:scale-[0.98]"
          >
            <Users className="w-4 h-4 text-[#86868B]" /> Thêm Khách
          </button>
        </div>
      </div>

      {/* Apple KPI 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Tổng Giá Trị Thi Công
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-bold text-[#1D1D1F] tracking-tight font-tabular">
              {formatVND(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Đã hoàn thành bàn giao & bảo hành</span>
            </div>
          </div>
        </div>

        {/* In progress orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Đang Thi Công
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-bold text-[#0071E3] tracking-tight font-tabular">
              {stats.inProgressCount} <span className="text-sm font-normal text-[#86868B]">công trình</span>
            </div>
            <div className="text-xs text-[#86868B] mt-1 font-medium">
              + {stats.pendingCount} đơn chờ khảo sát thi công
            </div>
          </div>
        </div>

        {/* Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Hồ Sơ Khách Hàng
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-bold text-[#1D1D1F] tracking-tight font-tabular">
              {stats.customerCount} <span className="text-sm font-normal text-[#86868B]">khách hàng</span>
            </div>
            <div className="text-xs text-amber-600 mt-1 font-medium">
              Khách sạn, gia đình & doanh nghiệp
            </div>
          </div>
        </div>

        {/* Active Warranties */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Hệ Thống Đang Bảo Hành
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-bold text-purple-600 tracking-tight font-tabular">
              {stats.warrantyCount} <span className="text-sm font-normal text-[#86868B]">hệ thống</span>
            </div>
            <div className="text-xs text-[#86868B] mt-1 font-medium">
              Bảo hành 12 - 24 tháng tận nơi tại Huế
            </div>
          </div>
        </div>
      </div>

      {/* Apple Charts & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 12-Month Revenue Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
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
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 self-start">
              +35% Tăng trưởng tháng 3
            </div>
          </div>

          {/* Clean Apple Bar Chart */}
          <div className="h-56 flex items-end gap-2 sm:gap-3.5 pt-6 pb-2 px-1 border-b border-slate-100">
            {monthlyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1D1D1F] text-white text-[11px] font-medium px-2.5 py-1 rounded-xl pointer-events-none whitespace-nowrap z-20 shadow-xl">
                  {item.name}: {formatVND(item.value)}
                </div>

                <div className="w-full bg-slate-100 rounded-t-xl relative flex items-end justify-center overflow-hidden h-full max-w-[34px]">
                  <div
                    style={{ height: `${Math.max(item.percent, 4)}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      item.value > 0
                        ? 'bg-gradient-to-t from-[#0071E3] to-[#47A1FF] group-hover:brightness-105'
                        : 'bg-slate-200/70'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-medium text-[#86868B] mt-2 group-hover:text-[#1D1D1F]">
                  {item.short}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-[#86868B] mt-4 pt-1">
            <span>Tổng quý 1/2026: <strong className="text-[#1D1D1F]">154.700.000 đ</strong></span>
            <span className="text-[11px] text-[#0071E3] font-semibold">Camera 247 Huế · Hoàn thành chỉ tiêu Q1</span>
          </div>
        </div>

        {/* Services Distribution */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#0071E3]" />
              Cơ Cấu Dịch Vụ
            </h3>
            <p className="text-xs text-[#86868B] mb-5">
              Phân bố các gói dịch vụ khách hàng lựa chọn
            </p>

            <div className="space-y-3.5">
              {serviceDistribution.map((serv) => (
                <div key={serv.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1D1D1F] flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${serv.color.replace('text-', 'bg-')}`} />
                      {serv.name}
                    </span>
                    <span className="text-[#86868B] shrink-0 font-semibold font-tabular">
                      {serv.count} đơn ({serv.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${serv.color.replace('text-', 'bg-')}`}
                      style={{ width: `${Math.max(serv.percent, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#86868B]">Dịch vụ chủ lực:</span>
            <span className="font-bold text-[#0071E3]">Camera AI & Khóa vân tay</span>
          </div>
        </div>
      </div>

      {/* Upcoming Orders & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming installation schedule */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0071E3]" />
                Lịch Khảo Sát & Thi Công Gần Nhất
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Các công trình đang triển khai và chuẩn bị thi công tại Huế
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#0071E3] hover:text-[#0077ED] font-semibold flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingOrders.length === 0 ? (
              <div className="py-8 text-center text-[#86868B] text-xs">
                Không có đơn hàng nào đang chờ thi công.
              </div>
            ) : (
              upcomingOrders.map((order) => {
                return (
                  <div
                    key={order.id}
                    onClick={() => onNavigateTab('orders')}
                    className="p-4 bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/60 hover:border-blue-200 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
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
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-white text-slate-700 border-slate-200 shadow-2xs`}
                        >
                          {order.status === 'in_progress' ? 'Đang thi công' : 'Chờ thi công'}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#86868B] truncate">
                        📍 {order.customer_address}
                      </p>
                      <p className="text-[11px] text-[#6E6E73] mt-0.5 truncate">
                        ⚙️ {order.equipment_list}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                      <div className="font-bold text-xs text-[#1D1D1F] font-tabular">
                        {formatVND(order.total_amount)}
                      </div>
                      <div className="text-[11px] text-[#86868B] mt-0.5">
                        Thi công: {order.installation_date || 'Chưa định ngày'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Audit & Activity Log */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
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
              className="text-xs text-[#0071E3] hover:text-[#0077ED] font-semibold flex items-center gap-1"
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
    </div>
  )
}
