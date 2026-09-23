'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Settings,
  Database,
  Download,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
  Users,
  Clock,
  HardDrive,
  Cloud,
  CloudUpload,
  CloudDownload,
  Trash2,
  X,
  Sparkles,
  Search,
  FileText,
  ClipboardList,
  ShieldCheck,
  Server
} from 'lucide-react'
import type { Customer, InstallationOrder, AccessLog, CloudBackup } from '@/lib/camera247-data'
import {
  getStoredCloudBackups,
  saveStoredCloudBackups,
} from '@/lib/camera247-data'
import type { Post, Category } from '@/lib/supabase'
import { formatDateTimeVN } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface SettingsBackupTabProps {
  customers: Customer[]
  orders: InstallationOrder[]
  posts: Post[]
  categories: Category[]
  logs: AccessLog[]
  onRestoreData: (importedData: {
    customers?: Customer[]
    orders?: InstallationOrder[]
    posts?: Post[]
    categories?: Category[]
    logs?: AccessLog[]
  }) => void
  onResetDefaultSamples?: () => void
  activeUser?: 'admin' | 'admin1'
  activeDisplayName?: string
}

export function SettingsBackupTab({
  customers,
  orders,
  posts,
  categories,
  logs,
  onRestoreData,
  activeUser = 'admin',
  activeDisplayName = 'Quản trị viên (Lập)',
}: SettingsBackupTabProps) {
  const [cloudBackups, setCloudBackups] = useState<CloudBackup[]>([])
  const [loadingCloud, setLoadingCloud] = useState(false)
  const [creatingCloudBackup, setCreatingCloudBackup] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchBackupQuery, setSearchBackupQuery] = useState('')

  // New Cloud Backup Form State
  const [newBackupName, setNewBackupName] = useState('')
  const [newBackupNotes, setNewBackupNotes] = useState('')
  const [creatorUser, setCreatorUser] = useState<'admin' | 'admin1'>('admin')

  // Load Cloud Backups on mount
  useEffect(() => {
    fetchCloudBackups()
  }, [])

  const fetchCloudBackups = async () => {
    setLoadingCloud(true)
    try {
      const res = await fetch('/api/backup')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.backups) && data.backups.length > 0) {
          setCloudBackups(data.backups)
          saveStoredCloudBackups(data.backups)
          setLoadingCloud(false)
          return
        }
      }
    } catch {
      // ignore
    }
    // Fallback to local stored cloud backups
    setCloudBackups(getStoredCloudBackups())
    setLoadingCloud(false)
  }

  // Handle Create Cloud Backup
  const handleCreateCloudBackup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBackupName.trim()) return

    setCreatingCloudBackup(true)
    const creatorName = creatorUser === 'admin' ? 'Quản trị viên (Lập)' : 'Quản trị viên (Tước)'
    const payload = { customers, orders, posts, categories, logs }

    const backupBody = {
      backup_name: newBackupName.trim(),
      version: '2.5',
      created_by: creatorUser,
      creator_name: creatorName,
      customers_count: customers.length,
      orders_count: orders.length,
      posts_count: posts.length,
      categories_count: categories.length,
      logs_count: logs.length,
      payload,
      notes: newBackupNotes.trim(),
    }

    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupBody),
      })
      const resData = await res.json()

      if (resData.ok && resData.backup) {
        setCloudBackups((prev) => [resData.backup, ...prev])
      } else {
        // Fallback local store
        const newLocalBackup: CloudBackup = {
          id: `cb-${Date.now()}`,
          backup_name: newBackupName.trim(),
          version: '2.5',
          created_by: creatorUser,
          creator_name: creatorName,
          customers_count: customers.length,
          orders_count: orders.length,
          posts_count: posts.length,
          categories_count: categories.length,
          logs_count: logs.length,
          file_size_bytes: new Blob([JSON.stringify(payload)]).size,
          notes: newBackupNotes.trim(),
          payload,
          created_at: new Date().toISOString(),
        }
        const updated = [newLocalBackup, ...cloudBackups]
        setCloudBackups(updated)
        saveStoredCloudBackups(updated)
      }

      setShowCreateModal(false)
      setNewBackupName('')
      setNewBackupNotes('')
    } catch {
      alert('Không thể kết nối máy chủ đám mây.')
    } finally {
      setCreatingCloudBackup(false)
    }
  }

  // Restore from a specific Cloud Backup
  const handleRestoreCloudBackup = (backup: CloudBackup) => {
    const confirmMsg = `Xác nhận khôi phục toàn bộ hệ thống từ bản sao lưu: "${backup.backup_name}" (Tạo bởi ${backup.creator_name} lúc ${formatDateTimeVN(backup.created_at)})?`
    if (!confirm(confirmMsg)) return

    if (backup.payload) {
      onRestoreData(backup.payload)
      alert(`Đã khôi phục thành công dữ liệu từ bản sao lưu "${backup.backup_name}"!`)
    } else {
      alert('Bản sao lưu này không chứa dữ liệu chi tiết.')
    }
  }

  // Delete a Cloud Backup
  const handleDeleteCloudBackup = async (id: string, name: string) => {
    if (!confirm(`Xác nhận xóa vĩnh viễn bản sao lưu "${name}"?`)) return
    try {
      await fetch(`/api/backup?id=${id}`, { method: 'DELETE' })
    } catch {
      // ignore
    }
    const updated = cloudBackups.filter((b) => b.id !== id)
    setCloudBackups(updated)
    saveStoredCloudBackups(updated)
  }

  // Download a Cloud Backup as JSON file
  const handleDownloadCloudBackupJson = (backup: CloudBackup) => {
    const dataToSave = backup.payload || {
      system: 'Camera 247 Huế - Cloud Backup Snapshot',
      backup_name: backup.backup_name,
      version: backup.version,
      creator_name: backup.creator_name,
      created_at: backup.created_at,
      customers,
      orders,
      posts,
      categories,
      logs,
    }
    const jsonStr = JSON.stringify(dataToSave, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `camera247hue-backup-${backup.id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filtered backups by search
  const filteredBackups = useMemo(() => {
    if (!searchBackupQuery.trim()) return cloudBackups
    const q = searchBackupQuery.toLowerCase().trim()
    return cloudBackups.filter(
      (b) =>
        b.backup_name.toLowerCase().includes(q) ||
        b.creator_name.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q)
    )
  }, [cloudBackups, searchBackupQuery])

  // Total size of backups
  const totalSizeBytes = useMemo(() => {
    return cloudBackups.reduce((acc, b) => acc + (b.file_size_bytes || 0), 0)
  }, [cloudBackups])

  // Latest backup date
  const latestBackup = cloudBackups.length > 0 ? cloudBackups[0] : null

  return (
    <div className="space-y-6">
      {/* Header Banner - Apple Light Style */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                Cài Đặt & Sao Lưu Đám Mây
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đồng bộ an toàn
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
              Quản lý, đóng gói và khôi phục toàn vẹn dữ liệu hệ thống Camera 247 Huế
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCloudBackups}
            disabled={loadingCloud}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-200 shadow-2xs active:scale-[0.98] transition-all"
            title="Tải lại danh sách"
          >
            <RefreshCw className={cn('w-4 h-4 text-slate-500', loadingCloud && 'animate-spin text-[#0071E3]')} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            onClick={() => {
              const nowStr = new Date().toLocaleDateString('vi-VN')
              setNewBackupName(`Bản Sao Lưu Toàn Hệ Thống - ${nowStr}`)
              setCreatorUser(activeUser)
              setShowCreateModal(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-[0_2px_8px_rgba(0,113,227,0.25)] active:scale-[0.98] transition-all"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Tạo Bản Sao Lưu Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bản sao lưu</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{cloudBackups.length}</span>
            <span className="text-xs text-slate-500">bản ghi</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dữ liệu hiện tại</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {customers.length + orders.length + posts.length}
            </span>
            <span className="text-xs text-slate-500">mục dữ liệu</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sao lưu gần nhất</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-slate-900 truncate block">
              {latestBackup ? formatDateTimeVN(latestBackup.created_at) : 'Chưa có bản lưu'}
            </span>
            <span className="text-[11px] text-slate-500">
              {latestBackup ? latestBackup.creator_name : 'Hệ thống'}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Trạng thái đám mây</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Sẵn Sàng
            </span>
            <span className="text-[11px] text-slate-500">
              {totalSizeBytes > 0 ? `(${(totalSizeBytes / 1024).toFixed(1)} KB)` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Cloud Backups Management Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">
                Danh Sách Bản Sao Lưu Hệ Thống
              </h2>
              <p className="text-xs text-[#86868B]">
                Các bản snapshot được đóng gói đầy đủ dữ liệu khách hàng, đơn hàng, bài viết & nhật ký
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchBackupQuery}
                onChange={(e) => setSearchBackupQuery(e.target.value)}
                placeholder="Tìm theo tên, người tạo..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
              />
              {searchBackupQuery && (
                <button
                  onClick={() => setSearchBackupQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List of Backups */}
        <div className="space-y-3.5">
          {filteredBackups.length === 0 ? (
            <div className="py-14 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {searchBackupQuery ? 'Không tìm thấy bản sao lưu phù hợp' : 'Chưa có bản sao lưu nào'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {searchBackupQuery
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc kiểm tra lại tên bản sao lưu.'
                    : 'Hãy tạo bản sao lưu định kỳ để bảo vệ dữ liệu khách hàng, đơn hàng và bài viết của bạn.'}
                </p>
              </div>
              {!searchBackupQuery && (
                <button
                  onClick={() => {
                    setNewBackupName(`Bản Sao Lưu Toàn Hệ Thống - ${new Date().toLocaleDateString('vi-VN')}`)
                    setShowCreateModal(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Tạo bản sao lưu ngay</span>
                </button>
              )}
            </div>
          ) : (
            filteredBackups.map((backup) => (
              <div
                key={backup.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white hover:bg-slate-50/50 transition-all space-y-3 group shadow-2xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Title & Meta */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0071E3] transition-colors">
                        {backup.backup_name}
                      </h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0071E3] border border-blue-200/60">
                        v{backup.version || '2.5'}
                      </span>
                      {backup.file_size_bytes ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          💾 {(backup.file_size_bytes / 1024).toFixed(1)} KB
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#0071E3]" />
                        {formatDateTimeVN(backup.created_at)}
                      </span>
                      <span>•</span>
                      <span>Người tạo: <strong className="text-slate-700">{backup.creator_name}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      onClick={() => handleRestoreCloudBackup(backup)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-2xs active:scale-95 transition-all"
                      title="Khôi phục dữ liệu từ bản sao lưu này"
                    >
                      <CloudDownload className="w-3.5 h-3.5" />
                      <span>Khôi phục</span>
                    </button>

                    <button
                      onClick={() => handleDownloadCloudBackupJson(backup)}
                      className="flex items-center gap-1 px-3 py-2 text-slate-700 hover:text-[#0071E3] hover:bg-blue-50 rounded-xl border border-slate-200 bg-white text-xs font-semibold transition-all shadow-2xs"
                      title="Tải tệp sao lưu .json về máy tính"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tải về</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCloudBackup(backup.id, backup.backup_name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 bg-white transition-all shadow-2xs"
                      title="Xóa bản sao lưu này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Data Entities Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 font-medium">
                    <Users className="w-3 h-3 text-[#0071E3]" />
                    <span><strong>{backup.customers_count}</strong> Khách hàng</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 font-medium">
                    <ClipboardList className="w-3 h-3 text-emerald-600" />
                    <span><strong>{backup.orders_count}</strong> Đơn thi công</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 font-medium">
                    <FileText className="w-3 h-3 text-purple-600" />
                    <span><strong>{backup.posts_count}</strong> Bài viết</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 font-medium">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span><strong>{backup.logs_count}</strong> Nhật ký</span>
                  </span>
                </div>

                {/* Notes if any */}
                {backup.notes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    &ldquo;{backup.notes}&rdquo;
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: TẠO BẢN SAO LƯU ĐÁM MÂY MỚI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tạo Bản Sao Lưu Đám Mây
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đóng gói snapshot dữ liệu hệ thống Camera 247 Huế
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCloudBackup} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Tên bản sao lưu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBackupName}
                  onChange={(e) => setNewBackupName(e.target.value)}
                  placeholder="Ví dụ: Bản sao lưu hoàn thiện tháng 3/2026..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] font-semibold transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Người thực hiện sao lưu
                </label>
                <select
                  value={creatorUser}
                  onChange={(e) => setCreatorUser(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all font-medium"
                >
                  <option value="admin">Quản trị viên (Lập) · @admin</option>
                  <option value="admin1">Quản trị viên (Tước) · @admin1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Ghi chú nội dung (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={newBackupNotes}
                  onChange={(e) => setNewBackupNotes(e.target.value)}
                  placeholder="Ghi chú thêm về thời điểm hoặc lý do sao lưu..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] resize-none transition-all"
                />
              </div>

              {/* Data summary box */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                  Dữ liệu đóng gói bao gồm:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  • <strong>{customers.length}</strong> khách hàng • <strong>{orders.length}</strong> đơn thi công •{' '}
                  <strong>{posts.length}</strong> bài viết • <strong>{logs.length}</strong> bản ghi nhật ký.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingCloudBackup}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {creatingCloudBackup ? 'Đang lưu...' : 'Lưu Lên Đám Mây'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
