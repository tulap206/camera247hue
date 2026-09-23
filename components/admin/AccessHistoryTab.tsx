'use client'

import { useState, useMemo } from 'react'
import {
  History,
  Search,
  RefreshCw,
  Globe,
  Users,
  Shield,
  LogIn,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Database,
  Eye,
  Activity,
  Laptop,
  Smartphone,
  X,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { formatDateTimeVN } from '@/lib/formatters'
import type { AccessLog } from '@/lib/camera247-data'
import { cn } from '@/lib/utils'

interface AccessHistoryTabProps {
  logs: AccessLog[]
  onRefresh: () => void
  onClearLogs?: () => void
}

const ACTION_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Đăng nhập': { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'Đăng xuất': { color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  'Thêm mới': { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  'Chỉnh sửa': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Cập nhật': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Xóa': { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  'Sao lưu': { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'Khôi phục': { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  'Xem': { color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
}

export function AccessHistoryTab({ logs, onRefresh, onClearLogs }: AccessHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<'all' | 'staff' | 'visitor'>('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 10

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Extract distinct accounts, modules, and actions
  const accounts = useMemo(() => {
    const list = Array.from(new Set(logs.map((l) => l.username).filter(Boolean)))
    return list.sort()
  }, [logs])

  const modules = useMemo(() => {
    const list = Array.from(new Set(logs.map((l) => l.module).filter(Boolean)))
    return list.sort()
  }, [logs])

  const actions = useMemo(() => {
    const list = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)))
    return list.sort()
  }, [logs])

  const visitorCount = useMemo(
    () => logs.filter((l) => l.username === 'visitor' || l.module === 'Khách xem Web').length,
    [logs]
  )
  const staffCount = useMemo(
    () => logs.filter((l) => l.username !== 'visitor' && l.module !== 'Khách xem Web').length,
    [logs]
  )
  const cudCount = useMemo(
    () =>
      logs.filter((l) =>
        ['Thêm mới', 'Chỉnh sửa', 'Cập nhật', 'Xóa', 'Sao lưu', 'Khôi phục'].includes(l.action)
      ).length,
    [logs]
  )

  // Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('Không có dữ liệu nhật ký để xuất!')
      return
    }

    const headers = ['Mã Log', 'Thời Gian', 'Tài Khoản', 'Tên Hiển Thị', 'Hành Động', 'Phân Hệ', 'Địa Chỉ IP', 'Chi Tiết Thao Tác']

    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${formatDateTimeVN(l.timestamp)}"`,
      `"${l.username}"`,
      `"${(l.displayName || '').replace(/"/g, '""')}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.ip_address || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ].join(','))

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Camera247_NhatKy_TruyCap_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyDetails = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLogId(id)
    setTimeout(() => setCopiedLogId(null), 2000)
  }

  // Filter logs
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return logs
      .filter((l) => {
        const isVisitor = l.username === 'visitor' || l.module === 'Khách xem Web'
        if (scopeFilter === 'visitor' && !isVisitor) return false
        if (scopeFilter === 'staff' && isVisitor) return false

        const matchSearch =
          !q ||
          l.details.toLowerCase().includes(q) ||
          l.username.toLowerCase().includes(q) ||
          l.displayName.toLowerCase().includes(q) ||
          (l.ip_address && l.ip_address.includes(q)) ||
          l.module.toLowerCase().includes(q)

        const matchAccount = accountFilter === 'all' || l.username === accountFilter
        const matchModule = moduleFilter === 'all' || l.module === moduleFilter
        const matchAction = actionFilter === 'all' || l.action === actionFilter

        return matchSearch && matchAccount && matchModule && matchAction
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, searchQuery, scopeFilter, accountFilter, moduleFilter, actionFilter])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE))
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredLogs, currentPage])

  return (
    <div className="space-y-6">
      {/* Apple Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
            <span>Audit Trail & Hệ Thống An Ninh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight mt-1">
            Lịch Sử Truy Cập & Nhật Ký Hoạt Động
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1 max-w-2xl">
            Theo dõi chi tiết các phiên đăng nhập quản trị, thao tác hợp đồng thi công, cập nhật khách hàng và lịch sử bảo mật hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
            title="Xuất nhật ký ra file Excel / CSV"
          >
            <Download className="w-4 h-4 text-[#86868B]" />
            <span>Xuất Excel</span>
          </button>

          {onClearLogs && (
            <button
              onClick={() => {
                if (confirm('Xác nhận dọn dẹp và làm sạch lịch sử nhật ký (trả về 5 bản ghi mẫu chuẩn)?')) {
                  onClearLogs()
                }
              }}
              className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100/80 text-rose-700 px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm border border-rose-200/80 transition-all shadow-2xs active:scale-[0.98]"
              title="Dọn dẹp nhật ký cũ"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Dọn Nhật Ký</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Apple Security KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Tổng Nhật Ký</span>
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/50">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tabular-nums tracking-tight">
              {logs.length}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Bản ghi kiểm toán an ninh</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Ban Quản Trị</span>
            <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 tabular-nums tracking-tight">
              {staffCount}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Thao tác từ @admin & @admin1</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Khách Xem Web</span>
            <div className="w-8 h-8 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/50">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-sky-600 tabular-nums tracking-tight">
              {visitorCount}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Khách truy cập & để lại liên hệ</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Thao Tác Dữ Liệu</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/50">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums tracking-tight">
              {cudCount}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Thêm / Sửa / Xóa / Sao lưu dữ liệu</p>
          </div>
        </div>
      </div>

      {/* Scope Segmented Pill Control & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Apple Segmented Control for Scope */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 self-start lg:self-auto max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setScopeFilter('all')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              scopeFilter === 'all'
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <History className="w-3.5 h-3.5" />
            Tất cả ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setScopeFilter('staff')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              scopeFilter === 'staff'
                ? 'bg-white text-[#0071E3] font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Ban Quản Trị ({staffCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setScopeFilter('visitor')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              scopeFilter === 'visitor'
                ? 'bg-white text-sky-700 font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            Khách Xem Web ({visitorCount})
          </button>
        </div>

        {/* Search & Detailed Filters */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap flex-1 lg:max-w-2xl">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm nội dung, tài khoản, IP thiết bị..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          {/* Account */}
          <select
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0 font-medium"
          >
            <option value="all">Tất cả tài khoản</option>
            {accounts.map((acc) => (
              <option key={acc} value={acc}>
                @{acc}
              </option>
            ))}
          </select>

          {/* Module */}
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0 font-medium"
          >
            <option value="all">Tất cả phân hệ</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Action */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0 font-medium"
          >
            <option value="all">Tất cả hành động</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Thời Gian</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tài Khoản</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Hành Động</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Phân Hệ</th>
                <th className="py-3.5 px-4 min-w-[280px]">Chi Tiết Hoạt Động</th>
                <th className="py-3.5 px-4 whitespace-nowrap">IP Thiết Bị</th>
                <th className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#1D1D1F]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center space-y-2">
                    <History className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-[#1D1D1F]">Không có nhật ký nào phù hợp</p>
                    <p className="text-xs text-[#86868B]">Thử làm mới hoặc thay đổi các tiêu chí lọc ở trên.</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
                  const actStyle = ACTION_CONFIG[log.action] || {
                    color: 'text-slate-700',
                    bg: 'bg-slate-100',
                    border: 'border-slate-200',
                  }
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-mono text-[#86868B] text-[11px]">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#86868B] text-[11px]">
                        {formatDateTimeVN(log.timestamp)}
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-[#1D1D1F] block">
                          {log.displayName || log.username}
                        </span>
                        <span className="text-[10px] text-[#86868B] font-mono">
                          @{log.username}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border',
                            actStyle.bg,
                            actStyle.color,
                            actStyle.border
                          )}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] text-[#1D1D1F] font-semibold bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/60">
                          {log.module}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4">
                        <p className="text-[#1D1D1F] font-medium line-clamp-2 leading-relaxed">
                          {log.details}
                        </p>
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#86868B]">
                        {log.ip_address || '113.161.78.45'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLog(log)
                          }}
                          className="p-1.5 rounded-xl text-slate-400 group-hover:text-[#0071E3] hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200 shadow-2xs"
                          title="Xem chi tiết nhật ký"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Apple Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-[#86868B]">
            <span>
              Trang {currentPage} / {totalPages} ({filteredLogs.length} bản ghi)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 rounded-2xl text-[#1D1D1F] font-semibold border border-slate-200 shadow-2xs transition-all"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 rounded-2xl text-[#1D1D1F] font-semibold border border-slate-200 shadow-2xs transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Sheet Modal (Apple Sheet Style) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60 shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">Chi Tiết Nhật Ký Hoạt Động</h3>
                  <p className="text-xs text-[#86868B] font-mono">Mã log: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Thời gian ghi nhận:</span>
                  <span className="font-mono text-[#1D1D1F] font-bold">{formatDateTimeVN(selectedLog.timestamp)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Tài khoản thao tác:</span>
                  <span className="text-[#0071E3] font-bold">{selectedLog.displayName} (@{selectedLog.username})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Hành động thực hiện:</span>
                  <span className="font-bold text-[#1D1D1F]">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Phân hệ liên quan:</span>
                  <span className="font-bold text-[#1D1D1F]">{selectedLog.module}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Địa chỉ IP thiết bị:</span>
                  <span className="font-mono text-[#1D1D1F] font-semibold">{selectedLog.ip_address || '113.161.78.45'}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#86868B] font-bold uppercase tracking-wider">
                    Nội dung chi tiết thao tác:
                  </span>
                  <button
                    onClick={() => handleCopyDetails(selectedLog.details, selectedLog.id)}
                    className="text-[11px] font-semibold text-[#0071E3] hover:underline inline-flex items-center gap-1"
                  >
                    {copiedLogId === selectedLog.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Sao chép
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-[#1D1D1F] font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2.5 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs font-bold border border-slate-200 transition-all active:scale-95"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
