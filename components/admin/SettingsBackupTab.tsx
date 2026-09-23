'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Settings,
  Database,
  Download,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Lock,
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
  Eye,
  EyeOff,
  User,
  Sparkles,
  Search
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

  // Password change form state
  const [targetUsername, setTargetUsername] = useState<'admin' | 'admin1'>('admin')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

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

  // Handle password submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ các thông tin mật khẩu.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' })
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword, username: targetUsername }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setPasswordMsg({
          type: 'success',
          text: `Đổi mật khẩu cho tài khoản @${targetUsername} (${targetUsername === 'admin' ? 'Lập' : 'Tước'}) thành công!`,
        })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Mật khẩu hiện tại không chính xác.' })
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Lỗi kết nối máy chủ.' })
    } finally {
      setPasswordLoading(false)
    }
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

  return (
    <div className="space-y-6">
      {/* Clean Apple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Settings className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Cài Đặt & Sao Lưu
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Quản lý sao lưu dữ liệu đám mây và bảo mật tài khoản quản trị hệ thống
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              const nowStr = new Date().toLocaleDateString('vi-VN')
              setNewBackupName(`Bản Sao Lưu Hệ Thống - ${nowStr}`)
              setCreatorUser(activeUser)
              setShowCreateModal(true)
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Tạo Bản Sao Lưu Mới</span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Backups List & Security Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Cloud Snapshots List (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 p-4 sm:p-6 shadow-sm space-y-4">
          {/* Header of Backup Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Bản Sao Lưu Đám Mây
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {cloudBackups.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Backup */}
              {cloudBackups.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchBackupQuery}
                    onChange={(e) => setSearchBackupQuery(e.target.value)}
                    placeholder="Tìm bản lưu..."
                    className="pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}

              <button
                onClick={fetchCloudBackups}
                disabled={loadingCloud}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                title="Làm mới danh sách"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', loadingCloud && 'animate-spin text-blue-600')} />
              </button>
            </div>
          </div>

          {/* Backup List */}
          <div className="space-y-3">
            {filteredBackups.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Cloud className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {searchBackupQuery ? 'Không tìm thấy bản sao lưu' : 'Chưa có bản sao lưu đám mây'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                    {searchBackupQuery
                      ? 'Thử đổi từ khóa tìm kiếm bản sao lưu.'
                      : 'Tạo bản sao lưu để đảm bảo an toàn cho dữ liệu khách hàng, đơn hàng và bài viết.'}
                  </p>
                </div>
                {!searchBackupQuery && (
                  <button
                    onClick={() => {
                      setNewBackupName(`Bản Sao Lưu Hệ Thống - ${new Date().toLocaleDateString('vi-VN')}`)
                      setShowCreateModal(true)
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    + Tạo bản sao lưu đầu tiên
                  </button>
                )}
              </div>
            ) : (
              filteredBackups.map((backup) => (
                <div
                  key={backup.id}
                  className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-500/40 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-800 transition-all space-y-2.5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Title & Creator */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                          {backup.backup_name}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          v{backup.version || '2.5'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {formatDateTimeVN(backup.created_at)}
                        </span>
                        <span>•</span>
                        <span>Người lưu: <strong>{backup.creator_name}</strong></span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleRestoreCloudBackup(backup)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm active:scale-95 transition-all"
                        title="Khôi phục dữ liệu từ bản sao lưu này"
                      >
                        <CloudDownload className="w-3.5 h-3.5" />
                        <span>Khôi phục</span>
                      </button>

                      <button
                        onClick={() => handleDownloadCloudBackupJson(backup)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
                        title="Tải tệp sao lưu .json về máy tính"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCloudBackup(backup.id, backup.backup_name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
                        title="Xóa bản sao lưu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                      👥 {backup.customers_count} Khách hàng
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                      📦 {backup.orders_count} Đơn hàng
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                      📝 {backup.posts_count} Bài viết
                    </span>
                    {backup.file_size_bytes ? (
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500">
                        💾 {(backup.file_size_bytes / 1024).toFixed(1)} KB
                      </span>
                    ) : null}
                  </div>

                  {/* Notes if any */}
                  {backup.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                      &ldquo;{backup.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Account Security & Password Management (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/60">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Bảo Mật Tài Khoản
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Đổi mật khẩu quản trị viên
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            {passwordMsg && (
              <div
                className={cn(
                  'p-3 rounded-xl text-xs flex items-center gap-2 border font-medium',
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                )}
              >
                {passwordMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            {/* Target Account Select Buttons */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Chọn tài khoản
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetUsername('admin')}
                  className={cn(
                    'p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all',
                    targetUsername === 'admin'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                  )}
                >
                  <span className="font-bold">@admin</span>
                  <span className="text-[10px] text-gray-500 font-normal">Quản trị viên (Lập)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetUsername('admin1')}
                  className={cn(
                    'p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all',
                    targetUsername === 'admin1'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                  )}
                >
                  <span className="font-bold">@admin1</span>
                  <span className="text-[10px] text-gray-500 font-normal">Quản trị viên (Tước)</span>
                </button>
              </div>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full px-3 py-2 pr-9 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3 py-2 pr-9 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL: TẠO BẢN SAO LƯU ĐÁM MÂY MỚI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CloudUpload className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Tạo Bản Sao Lưu Đám Mây
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Đóng gói snapshot dữ liệu hệ thống an toàn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCloudBackup} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tên bản sao lưu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBackupName}
                  onChange={(e) => setNewBackupName(e.target.value)}
                  placeholder="Ví dụ: Bản sao lưu hoàn thiện tháng 3/2026..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Người thực hiện sao lưu
                </label>
                <select
                  value={creatorUser}
                  onChange={(e) => setCreatorUser(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="admin">Quản trị viên (Lập) · @admin</option>
                  <option value="admin1">Quản trị viên (Tước) · @admin1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú nội dung (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={newBackupNotes}
                  onChange={(e) => setNewBackupNotes(e.target.value)}
                  placeholder="Ghi chú thêm về thời điểm hoặc lý do sao lưu..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Data summary box */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <span className="font-bold block">📦 Dữ liệu đóng gói bao gồm:</span>
                <p>
                  • <strong>{customers.length}</strong> khách hàng • <strong>{orders.length}</strong> đơn thi công •{' '}
                  <strong>{posts.length}</strong> bài viết • <strong>{logs.length}</strong> bản ghi nhật ký.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingCloudBackup}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {creatingCloudBackup ? 'Đang lưu...' : 'Lưu lên Đám mây'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
