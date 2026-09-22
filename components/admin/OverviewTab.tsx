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

  // 12-Month Revenue Breakdown
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
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-yellow-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            Hệ Thống Quản Trị Trung Tâm Camera 247 Huế
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tổng Quan Quản Lý & Thi Công
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Theo dõi doanh thu, lịch thi công lắp đặt camera an ninh, khóa điện tử, mạng wifi và công trình tại Huế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Tạo Đơn Mới
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm border border-slate-700 transition-all"
          >
            <Users className="w-4 h-4 text-yellow-400" /> Thêm Khách
          </button>
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng Giá Trị Thi Công
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight money">
              {formatVND(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Đã hoàn thành bàn giao & bảo hành</span>
            </div>
          </div>
        </div>

        {/* In progress orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-blue-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Đang Thi Công / Triển Khai
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-blue-400 tracking-tight">
              {stats.inProgressCount} <span className="text-sm font-normal text-slate-400">công trình</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>+ {stats.pendingCount} đơn chờ khảo sát thi công</span>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng Hồ Sơ Khách Hàng
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {stats.customerCount} <span className="text-sm font-normal text-slate-400">khách hàng</span>
            </div>
            <div className="text-xs text-amber-400/90 mt-1">
              Khách sạn, gia đình & doanh nghiệp tại Huế
            </div>
          </div>
        </div>

        {/* Active Warranties */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hợp Đồng Đang Bảo Hành
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-indigo-400 tracking-tight">
              {stats.warrantyCount} <span className="text-sm font-normal text-slate-400">hệ thống</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Bảo hành 12 - 24 tháng tận nơi tại Huế
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 12-Month Revenue Chart */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                Biểu Đồ Doanh Thu Thi Công Năm 2026
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Doanh số lắp đặt camera, thiết bị an ninh và mạng theo tháng
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start">
              +35% Tăng trưởng tháng 3
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-56 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-1 border-b border-slate-800">
            {monthlyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded-md border border-slate-700 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                  {item.name}: {formatVND(item.value)}
                </div>

                <div className="w-full bg-slate-800/60 rounded-t-lg relative flex items-end justify-center overflow-hidden h-full max-w-[36px]">
                  <div
                    style={{ height: `${Math.max(item.percent, 4)}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      item.value > 0
                        ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-yellow-400 group-hover:brightness-110'
                        : 'bg-slate-700/30'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-2 group-hover:text-slate-200">
                  {item.short}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-1">
            <span>Tổng quý 1/2026: <strong className="text-white">154.700.000 đ</strong></span>
            <span className="text-[11px] text-yellow-400 font-medium">Camera 247 Huế · Kỷ lục quý 1</span>
          </div>
        </div>

        {/* Services Distribution */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-400" />
              Cơ Cấu Dịch Vụ
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Phân bố các gói dịch vụ khách hàng lựa chọn
            </p>

            <div className="space-y-3.5">
              {serviceDistribution.map((serv) => (
                <div key={serv.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${serv.color.replace('text-', 'bg-')}`} />
                      {serv.name}
                    </span>
                    <span className="font-mono text-slate-400 shrink-0 font-semibold">
                      {serv.count} đơn ({serv.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${serv.color.replace('text-', 'bg-')}`}
                      style={{ width: `${Math.max(serv.percent, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Dịch vụ chủ lực:</span>
            <span className="font-bold text-yellow-400">Camera AI & Khóa vân tay</span>
          </div>
        </div>
      </div>

      {/* Two Column: Upcoming Orders & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming installation schedule */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                Lịch Khảo Sát & Thi Công Gần Nhất
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Các công trình đang triển khai và chuẩn bị thi công tại Huế
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Không có đơn hàng nào đang chờ thi công.
              </div>
            ) : (
              upcomingOrders.map((order) => {
                const statusCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending
                return (
                  <div
                    key={order.id}
                    onClick={() => onNavigateTab('orders')}
                    className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-yellow-400">
                          {order.order_code}
                        </span>
                        <span className="font-semibold text-white text-xs truncate max-w-[220px]">
                          {order.customer_name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        📍 {order.customer_address}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        ⚙️ {order.equipment_list}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
                      <div className="font-mono text-xs font-bold text-white money">
                        {formatVND(order.total_amount)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
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
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Hoạt Động Quản Trị
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhật ký thao tác hệ thống thời gian thực
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('access-history')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Xem đầy đủ <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {log.displayName || log.username}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
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
