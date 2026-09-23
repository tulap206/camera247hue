'use client'

import React, { useState, useMemo } from 'react'
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
  Tablet,
  X,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Clock,
  Filter,
  User,
  ShieldAlert,
  ChevronRight,
  Monitor
} from 'lucide-react'
import { formatDateTimeVN } from '@/lib/formatters'
import type { AccessLog } from '@/lib/camera247-data'
import { cn } from '@/lib/utils'
import PaginationControl from './PaginationControl'

interface AccessHistoryTabProps {
  logs: AccessLog[]
  onRefresh: () => void
  onClearLogs?: () => void
}

const ACTION_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  'Xem trang': { color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/30', border: 'border-sky-200 dark:border-sky-800', icon: Globe },
  'Đăng nhập': { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800', icon: LogIn },
  'Đăng xuất': { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-gray-800', border: 'border-slate-200 dark:border-gray-700', icon: LogOut },
  'Thêm mới': { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', icon: Plus },
  'Chỉnh sửa': { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', icon: Edit2 },
  'Cập nhật': { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', icon: Edit2 },
  'Cập nhật trạng thái': { color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800', icon: Activity },
  'Xóa': { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-800', icon: Trash2 },
  'Sao lưu': { color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800', icon: Database },
  'Khôi phục': { color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800', icon: RotateCcw },
}

export function AccessHistoryTab({ logs, onRefresh, onClearLogs }: AccessHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'visitor' | 'admin' | 'admin1' | 'today'>('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 12

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 400)
  }

  // Extract distinct modules and actions
  const modules = useMemo(() => {
    const list = Array.from(new Set(logs.map((l) => l.module).filter(Boolean)))
    return list.sort()
  }, [logs])

  const actions = useMemo(() => {
    const list = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)))
    return list.sort()
  }, [logs])

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Source filter
      if (sourceFilter === 'visitor') {
        if (log.username !== 'visitor' && log.module !== 'Landing Page' && log.module !== 'Khách xem Web') {
          return false
        }
      } else if (sourceFilter === 'admin') {
        if (log.username !== 'admin') return false
      } else if (sourceFilter === 'admin1') {
        if (log.username !== 'admin1') return false
      } else if (sourceFilter === 'today') {
        if (!log.timestamp?.startsWith(todayStr)) return false
      }

      // 2. Module filter
      if (moduleFilter !== 'all' && log.module !== moduleFilter) return false

      // 3. Action filter
      if (actionFilter !== 'all' && log.action !== actionFilter) return false

      // 4. Device filter
      if (deviceFilter !== 'all') {
        if (deviceFilter === 'mobile' && log.device_type !== 'mobile') return false
        if (deviceFilter === 'desktop' && log.device_type !== 'desktop') return false
        if (deviceFilter === 'tablet' && log.device_type !== 'tablet') return false
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchDetails = log.details?.toLowerCase().includes(q)
        const matchUser = log.displayName?.toLowerCase().includes(q) || log.username?.toLowerCase().includes(q)
        const matchAction = log.action?.toLowerCase().includes(q)
        const matchModule = log.module?.toLowerCase().includes(q)
        const matchDevice = log.device?.toLowerCase().includes(q)
        const matchIp = log.ip_address?.toLowerCase().includes(q)
        if (!matchDetails && !matchUser && !matchAction && !matchModule && !matchDevice && !matchIp) {
          return false
        }
      }

      return true
    })
  }, [logs, sourceFilter, moduleFilter, actionFilter, deviceFilter, searchQuery, todayStr])

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredLogs, currentPage, ITEMS_PER_PAGE])

  // Copy Log detail
  const handleCopyLog = (log: AccessLog) => {
    const text = `[${formatDateTimeVN(log.timestamp)}] ${log.displayName} (@${log.username}) - ${log.action} [${log.module}]: ${log.details} | Thiết bị: ${log.device || 'N/A'} (IP: ${log.ip_address || 'N/A'})`
    navigator.clipboard.writeText(text)
    setCopiedLogId(log.id)
    setTimeout(() => setCopiedLogId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Clean Apple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <History className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Lịch Sử Truy Cập
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Ghi nhận chi tiết nhật ký khách xem website và lịch sử thao tác của ban quản trị
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95"
            title="Làm mới danh sách nhật ký"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-blue-600', isRefreshing && 'animate-spin')} />
            <span>Làm mới</span>
          </button>

          {onClearLogs && logs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký truy cập hiện tại?')) {
                  onClearLogs()
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95"
              title="Xóa toàn bộ lịch sử"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa lịch sử</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Tier Smart Filter Bar */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700/60 shadow-sm space-y-3">
        {/* Tier 1: Quick Source Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-gray-400 font-semibold px-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Lọc nhanh:
          </span>
          {[
            { id: 'all' as const, label: 'Tất cả nhật ký', count: logs.length },
            {
              id: 'visitor' as const,
              label: 'Khách xem Web',
              count: logs.filter(
                (l) => l.username === 'visitor' || l.module === 'Landing Page' || l.module === 'Khách xem Web'
              ).length,
            },
            {
              id: 'admin' as const,
              label: 'Admin (Lập)',
              count: logs.filter((l) => l.username === 'admin').length,
            },
            {
              id: 'admin1' as const,
              label: 'Admin (Tước)',
              count: logs.filter((l) => l.username === 'admin1').length,
            },
            {
              id: 'today' as const,
              label: 'Hôm nay',
              count: logs.filter((l) => l.timestamp?.startsWith(todayStr)).length,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSourceFilter(item.id)
                setCurrentPage(1)
              }}
              className={cn(
                'px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
                sourceFilter === item.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <span>{item.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  sourceFilter === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                )}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tier 2: Search, Module, Device, Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm nội dung, IP, người dùng..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Tất cả phân hệ</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Tất cả thiết bị</option>
              <option value="desktop">💻 Máy tính (Desktop / Laptop)</option>
              <option value="mobile">📱 Điện thoại (Mobile)</option>
              <option value="tablet">📟 Máy tính bảng (Tablet)</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
      </div>

      {/* Main Logs Table & Cards */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 w-44">Thời Gian</th>
                <th className="py-3 px-4 w-52">Người Thực Hiện</th>
                <th className="py-3 px-4 w-40">Hành Động / Phân Hệ</th>
                <th className="py-3 px-4">Nội Dung Chi Tiết</th>
                <th className="py-3 px-4 w-56">Thiết Bị & Địa Chỉ IP</th>
                <th className="py-3 px-3 text-right w-16">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <History className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      Không tìm thấy bản ghi nhật ký phù hợp
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Thử thay đổi từ khóa hoặc thiết lập lại bộ lọc.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const actionCfg = ACTION_CONFIG[log.action] || {
                    color: 'text-gray-700 dark:text-gray-300',
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    border: 'border-gray-200 dark:border-gray-700',
                    icon: Activity,
                  }
                  const ActionIcon = actionCfg.icon
                  const isVisitor =
                    log.username === 'visitor' ||
                    log.module === 'Landing Page' ||
                    log.module === 'Khách xem Web'

                  const isMobile =
                    log.device_type === 'mobile' ||
                    /iPhone|Android|Mobile/i.test(log.device || '')
                  const isTablet =
                    log.device_type === 'tablet' || /iPad|Tablet/i.test(log.device || '')

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{formatDateTimeVN(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* User / Source */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                              isVisitor
                                ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                                : log.username === 'admin1'
                                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                                : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                            )}
                          >
                            {isVisitor ? (
                              <Globe className="w-3.5 h-3.5" />
                            ) : log.username === 'admin1' ? (
                              'T'
                            ) : (
                              'L'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {log.displayName || (isVisitor ? 'Khách xem Web' : 'Quản trị viên')}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              @{log.username || 'admin'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Action & Module */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border',
                              actionCfg.bg,
                              actionCfg.color,
                              actionCfg.border
                            )}
                          >
                            <ActionIcon className="w-3 h-3 shrink-0" />
                            <span>{log.action}</span>
                          </span>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {log.module}
                          </p>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                        <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                      </td>

                      {/* Device & IP */}
                      <td className="py-3 px-4 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium truncate">
                            {isMobile ? (
                              <Smartphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            ) : isTablet ? (
                              <Tablet className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            ) : (
                              <Monitor className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate text-[11px]">
                              {log.device || (isMobile ? 'Mobile' : 'Desktop')}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            IP: {log.ip_address || '113.161.78.45'}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyLog(log)
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Sao chép bản ghi"
                        >
                          {copiedLogId === log.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {paginatedLogs.length === 0 ? (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400 p-4">
              <History className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                Không có bản ghi nhật ký phù hợp
              </p>
            </div>
          ) : (
            paginatedLogs.map((log) => {
              const actionCfg = ACTION_CONFIG[log.action] || {
                color: 'text-gray-700 dark:text-gray-300',
                bg: 'bg-gray-100 dark:bg-gray-800',
                border: 'border-gray-200 dark:border-gray-700',
                icon: Activity,
              }
              const isVisitor =
                log.username === 'visitor' ||
                log.module === 'Landing Page' ||
                log.module === 'Khách xem Web'

              const isMobile =
                log.device_type === 'mobile' || /iPhone|Android|Mobile/i.test(log.device || '')

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-3.5 space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                          isVisitor
                            ? 'bg-sky-100 text-sky-700'
                            : log.username === 'admin1'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {isVisitor ? <Globe className="w-3 h-3" /> : log.username === 'admin1' ? 'T' : 'L'}
                      </div>
                      <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                        {log.displayName || (isVisitor ? 'Khách xem Web' : 'Admin')}
                      </span>
                    </div>

                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold border shrink-0',
                        actionCfg.bg,
                        actionCfg.color,
                        actionCfg.border
                      )}
                    >
                      {log.action}
                    </span>
                  </div>

                  <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-2">
                    {log.details}
                  </p>

                  <div className="flex items-center justify-between text-[10.5px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      {isMobile ? (
                        <Smartphone className="w-3 h-3 text-amber-500" />
                      ) : (
                        <Monitor className="w-3 h-3 text-blue-500" />
                      )}
                      <span className="truncate max-w-[140px]">{log.device || 'Thiết bị'}</span>
                    </div>
                    <span className="font-mono">{formatDateTimeVN(log.timestamp)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLogs.length}
              itemsPerPage={ITEMS_PER_PAGE}
              itemLabel="nhật ký"
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* DETAIL LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Chi Tiết Nhật Ký</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs text-gray-700 dark:text-gray-300">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Thời gian:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {formatDateTimeVN(selectedLog.timestamp)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Người thực hiện:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedLog.displayName} (@{selectedLog.username})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phân hệ:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedLog.module}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hành động:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Thiết bị:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedLog.device || 'Máy tính / Trình duyệt'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Địa chỉ IP:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{selectedLog.ip_address || '113.161.78.45'}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Nội Dung Thao Tác
                </span>
                <p className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed text-gray-900 dark:text-white font-medium">
                  {selectedLog.details}
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLog(selectedLog)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLogId === selectedLog.id ? 'Đã sao chép!' : 'Sao chép thông tin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-200"
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
