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
} from 'lucide-react'
import { formatDateTimeVN } from '@/lib/formatters'
import type { AccessLog } from '@/lib/camera247-data'

interface AccessHistoryTabProps {
  logs: AccessLog[]
  onRefresh: () => void
}

const ACTION_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Đăng nhập': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'Đăng xuất': { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' },
  'Thêm mới': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'Chỉnh sửa': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Cập nhật': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Xóa': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  'Sao lưu': { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  'Khôi phục': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'Xem': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
}

export function AccessHistoryTab({ logs, onRefresh }: AccessHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<'all' | 'visitor' | 'staff'>('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  const visitorCount = useMemo(() => logs.filter((l) => l.username === 'visitor' || l.module === 'Khách xem Web').length, [logs])
  const staffCount = useMemo(() => logs.filter((l) => l.username !== 'visitor' && l.module !== 'Khách xem Web').length, [logs])

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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-yellow-400" />
            Nhật Ký & Lịch Sử Truy Cập Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi chi tiết các phiên đăng nhập, thao tác đơn hàng, khách hàng và khách ghé thăm website.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-yellow-400' : ''}`} />
          Làm Mới Nhật Ký
        </button>
      </div>

      {/* Scope Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setScopeFilter('all')
            setCurrentPage(1)
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            scopeFilter === 'all'
              ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Tất cả hoạt động ({logs.length})
        </button>

        <button
          onClick={() => {
            setScopeFilter('staff')
            setCurrentPage(1)
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            scopeFilter === 'staff'
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-slate-900 border-slate-800 text-blue-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Ban Quản Trị & Kỹ Thuật ({staffCount})
        </button>

        <button
          onClick={() => {
            setScopeFilter('visitor')
            setCurrentPage(1)
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            scopeFilter === 'visitor'
              ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
              : 'bg-slate-900 border-slate-800 text-cyan-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Khách Xem Landing Page ({visitorCount})
        </button>
      </div>

      {/* Search & Detailed Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm theo nội dung, tài khoản, IP..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Account */}
          <select
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
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
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
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
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
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

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">Thời Gian</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tài Khoản</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Hành Động</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Phân Hệ</th>
                <th className="py-3.5 px-4">Chi Tiết Hoạt Động</th>
                <th className="py-3.5 px-4 whitespace-nowrap">IP / Thiết Bị</th>
                <th className="py-3.5 px-4 text-center w-12">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không có nhật ký nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const actStyle = ACTION_CONFIG[log.action] || {
                    color: 'text-slate-300',
                    bg: 'bg-slate-800',
                    border: 'border-slate-700',
                  }
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {formatDateTimeVN(log.timestamp)}
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-white block">
                          {log.displayName || log.username}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          @{log.username}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${actStyle.bg} ${actStyle.color} ${actStyle.border}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] text-slate-300 font-medium bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                          {log.module}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-slate-200 line-clamp-2 leading-relaxed">
                          {log.details}
                        </p>
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {log.ip_address || '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLog(log)
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Trang {currentPage} / {totalPages} ({filteredLogs.length} bản ghi)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-white font-medium"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-white font-medium"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121620] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E121A]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Chi Tiết Nhật Ký Hoạt Động
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian:</span>
                  <span className="font-mono text-white font-semibold">{formatDateTimeVN(selectedLog.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tài khoản:</span>
                  <span className="text-yellow-400 font-semibold">{selectedLog.displayName} (@{selectedLog.username})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hành động:</span>
                  <span className="font-semibold text-white">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phân hệ:</span>
                  <span className="font-semibold text-blue-400">{selectedLog.module}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Địa chỉ IP:</span>
                  <span className="font-mono text-slate-300">{selectedLog.ip_address || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Nội dung chi tiết thao tác:
                </span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
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
