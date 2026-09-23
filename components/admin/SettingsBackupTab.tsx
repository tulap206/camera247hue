'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import {
  Settings,
  Database,
  Download,
  Upload,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Layers,
  Lock,
  PhoneCall,
  RefreshCw,
  Server,
  UserCheck,
  Check,
  Info,
  RotateCcw,
  Sparkles,
  Users,
  FileText,
  Clock,
  HardDrive,
  Cloud,
  CloudUpload,
  CloudDownload,
  Trash2,
  Code2,
  Copy,
  ExternalLink,
  X,
  History,
} from 'lucide-react'
import type { Customer, InstallationOrder, AccessLog, CloudBackup } from '@/lib/camera247-data'
import {
  getStoredCloudBackups,
  saveStoredCloudBackups,
  SAMPLE_CLOUD_BACKUPS,
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
}

const SUPABASE_SQL_SCRIPT = `-- =======================================================
-- SQL SCRIPT: TẠO BẢNG SAO LƯU ĐÁM MÂY CHO CAMERA 247 HUẾ
-- Hướng dẫn: Mở Supabase Dashboard -> SQL Editor -> Dán đoạn mã này và bấm RUN
-- =======================================================

CREATE TABLE IF NOT EXISTS public.cloud_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '2.5',
  created_by TEXT NOT NULL DEFAULT 'admin',
  creator_name TEXT NOT NULL DEFAULT 'Quản trị viên (Lập)',
  customers_count INTEGER NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  categories_count INTEGER NOT NULL DEFAULT 0,
  logs_count INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  file_size_bytes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật tính năng Row Level Security (RLS)
ALTER TABLE public.cloud_backups ENABLE ROW LEVEL SECURITY;

-- Cấp quyền truy cập cho ứng dụng quản trị Camera 247 Huế
DROP POLICY IF EXISTS "Allow full access for admin on cloud_backups" ON public.cloud_backups;
CREATE POLICY "Allow full access for admin on cloud_backups" 
  ON public.cloud_backups FOR ALL USING (true) WITH CHECK (true);
`

export function SettingsBackupTab({
  customers,
  orders,
  posts,
  categories,
  logs,
  onRestoreData,
  onResetDefaultSamples,
}: SettingsBackupTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [cloudBackups, setCloudBackups] = useState<CloudBackup[]>([])
  const [loadingCloud, setLoadingCloud] = useState(false)
  const [creatingCloudBackup, setCreatingCloudBackup] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSqlModal, setShowSqlModal] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  // New Cloud Backup Form
  const [newBackupName, setNewBackupName] = useState('')
  const [newBackupNotes, setNewBackupNotes] = useState('')
  const [creatorUser, setCreatorUser] = useState<'admin' | 'admin1'>('admin')

  const [importPreview, setImportPreview] = useState<{
    customersCount: number
    ordersCount: number
    postsCount: number
    categoriesCount: number
    logsCount: number
    timestamp: string
    rawData: any
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Password change form
  const [username, setUsername] = useState<'admin' | 'admin1'>('admin')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      alert(`Đã lưu bản sao lưu đám mây "${newBackupName}" thành công!`)
    } catch {
      alert('Không thể kết nối máy chủ đám mây.')
    } finally {
      setCreatingCloudBackup(false)
    }
  }

  // Restore from a specific Cloud Backup
  const handleRestoreCloudBackup = (backup: CloudBackup) => {
    const confirmMsg = `Xác nhận khôi phục dữ liệu từ bản sao lưu đám mây: "${backup.backup_name}" (Tạo bởi ${backup.creator_name} lúc ${formatDateTimeVN(backup.created_at)})?`
    if (!confirm(confirmMsg)) return

    if (backup.payload) {
      onRestoreData(backup.payload)
      alert(`Đã khôi phục thành công dữ liệu từ bản sao lưu "${backup.backup_name}"!`)
    } else {
      alert('Bản sao lưu này không chứa payload chi tiết.')
    }
  }

  // Delete a Cloud Backup
  const handleDeleteCloudBackup = async (id: string, name: string) => {
    if (!confirm(`Xác nhận xóa bản sao lưu đám mây "${name}"?`)) return
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
    link.download = `camera247hue-cloud-snapshot-${backup.id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Estimated JSON size
  const estimatedPayloadSize = useMemo(() => {
    try {
      const payload = { customers, orders, posts, categories, logs }
      const str = JSON.stringify(payload)
      const bytes = new Blob([str]).size
      return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`
    } catch {
      return '12.5 KB'
    }
  }, [customers, orders, posts, categories, logs])

  // Handle JSON Export Offline
  const handleExportBackupOffline = () => {
    setExporting(true)
    try {
      const backupPayload = {
        system: 'Camera 247 Huế - Management System',
        version: '2.5',
        exported_at: new Date().toISOString(),
        customers,
        orders,
        posts,
        categories,
        logs,
      }

      const jsonStr = JSON.stringify(backupPayload, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const dateTag = new Date().toISOString().split('T')[0]
      link.href = url
      link.download = `camera247hue-offline-backup-${dateTag}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(`Lỗi khi xuất file sao lưu: ${e.message}`)
    } finally {
      setExporting(false)
    }
  }

  // Handle file select for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImportError(null)
    setImporting(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Định dạng tệp JSON không hợp lệ.')
        }

        const customersCount = Array.isArray(parsed.customers) ? parsed.customers.length : 0
        const ordersCount = Array.isArray(parsed.orders) ? parsed.orders.length : 0
        const postsCount = Array.isArray(parsed.posts) ? parsed.posts.length : 0
        const categoriesCount = Array.isArray(parsed.categories) ? parsed.categories.length : 0
        const logsCount = Array.isArray(parsed.logs) ? parsed.logs.length : 0

        setImportPreview({
          customersCount,
          ordersCount,
          postsCount,
          categoriesCount,
          logsCount,
          timestamp: parsed.exported_at || new Date().toISOString(),
          rawData: parsed,
        })
      } catch (err: any) {
        setImportError(err.message || 'Không thể đọc tệp JSON sao lưu.')
      } finally {
        setImporting(false)
      }
    }
    reader.readAsText(file)
  }

  // Confirm restore offline
  const handleConfirmRestoreOffline = () => {
    if (!importPreview?.rawData) return
    onRestoreData(importPreview.rawData)
    setImportPreview(null)
    alert('Khôi phục dữ liệu từ tệp sao lưu thành công!')
  }

  // Copy SQL script
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2500)
  }

  // Handle password submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ các trường.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới không trùng khớp.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword, username }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setPasswordMsg({
          type: 'success',
          text: `Đổi mật khẩu cho tài khoản @${username} (${username === 'admin' ? 'Lập' : 'Tước'}) thành công!`,
        })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Mật khẩu cũ không chính xác.' })
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Lỗi kết nối máy chủ.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Apple Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
            <span>Hệ Thống Sao Lưu Đám Mây & An Ninh Dữ Liệu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight mt-1">
            Cài Đặt Hệ Thống & Sao Lưu Đám Mây
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1 max-w-2xl">
            Tạo và quản lý các bản snapshot sao lưu đám mây (Cloud Database), phân quyền tài khoản Quản trị viên Lập (@admin) & Tước (@admin1).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={() => setShowSqlModal(true)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
            title="Xem mã lệnh SQL tạo bảng trên Supabase"
          >
            <Code2 className="w-4 h-4 text-[#0071E3]" />
            <span>Lệnh SQL Editor</span>
          </button>

          <button
            onClick={() => {
              setNewBackupName(`Bản Sao Lưu Đám Mây - ${new Date().toLocaleDateString('vi-VN')}`)
              setShowCreateModal(true)
            }}
            className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Sao Lưu Lên Đám Mây</span>
          </button>
        </div>
      </div>

      {/* 4 System Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Snapshot Đám Mây</span>
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/50">
              <Cloud className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tabular-nums tracking-tight">
              {cloudBackups.length}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Bản sao lưu trên Cloud</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Dữ Liệu Đang Quản Lý</span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/50">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums tracking-tight">
              {customers.length + orders.length + posts.length}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">
              {customers.length} KH • {orders.length} Đơn • {posts.length} Bài
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Dung Lượng Snapshot</span>
            <div className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/50">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 tabular-nums tracking-tight">
              {estimatedPayloadSize}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Dữ liệu JSON nén nhẹ</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Bản Lưu Gần Nhất</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/50">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-bold text-[#1D1D1F] truncate mt-1">
              {cloudBackups[0]?.created_at
                ? formatDateTimeVN(cloudBackups[0].created_at)
                : 'Mới khởi tạo'}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">
              {cloudBackups[0]?.creator_name || 'Hệ thống'}
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Snapshots Timeline List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wider">
              <Cloud className="w-4 h-4" />
              <span>Kho Lưu Trữ Snapshot Đám Mây (Cloud Database)</span>
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] mt-1">
              Lịch Sử Các Bản Sao Lưu Đám Mây
            </h3>
          </div>

          <button
            onClick={fetchCloudBackups}
            disabled={loadingCloud}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl text-[#1D1D1F] transition-all"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-[#0071E3]', loadingCloud && 'animate-spin')} />
            <span>Làm Mới Danh Sách</span>
          </button>
        </div>

        {/* Snapshots Table / Cards */}
        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
          {cloudBackups.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Cloud className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-[#1D1D1F]">Chưa có bản sao lưu đám mây nào</p>
              <p className="text-xs text-[#86868B]">Nhấn nút "Sao Lưu Lên Đám Mây" ở góc trên để tạo snapshot đầu tiên.</p>
            </div>
          ) : (
            cloudBackups.map((backup) => (
              <div
                key={backup.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                      {backup.backup_name}
                    </span>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0071E3] border border-blue-200">
                      v{backup.version || '2.5'}
                    </span>
                    <span className="text-[11px] text-[#86868B] font-medium">
                      bởi <strong>{backup.creator_name}</strong>
                    </span>
                  </div>

                  {backup.notes && (
                    <p className="text-xs text-[#86868B] line-clamp-1">{backup.notes}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#86868B] flex-wrap pt-0.5">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDateTimeVN(backup.created_at)}
                    </span>
                    <span>•</span>
                    <span>👥 {backup.customers_count} Khách</span>
                    <span>•</span>
                    <span>📦 {backup.orders_count} Đơn hàng</span>
                    <span>•</span>
                    <span>📝 {backup.posts_count} Bài viết</span>
                    {backup.file_size_bytes && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[11px]">
                          💾 {(backup.file_size_bytes / 1024).toFixed(1)} KB
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => handleRestoreCloudBackup(backup)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 transition-all shadow-2xs active:scale-95"
                    title="Khôi phục toàn bộ dữ liệu từ bản sao lưu đám mây này"
                  >
                    <CloudDownload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Khôi Phục</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCloudBackupJson(backup)}
                    className="p-2 text-slate-500 hover:text-[#0071E3] hover:bg-blue-50 rounded-xl transition-all border border-slate-200/60"
                    title="Tải snapshot JSON về máy tính"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteCloudBackup(backup.id, backup.backup_name)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-rose-200/60"
                    title="Xóa bản sao lưu khỏi đám mây"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Two Column Grid: Offline Backup & Password Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Offline Backup Tools */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wider">
                <FileJson className="w-4 h-4" />
                <span>Sao Lưu & Dự Phòng Ngoại Tuyến (Offline JSON)</span>
              </div>
              <h3 className="text-lg font-bold text-[#1D1D1F] mt-1">
                Tệp JSON Dự Phòng & Đặt Lại Dữ Liệu Mẫu
              </h3>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                Tải tệp sao lưu JSON trực tiếp về ổ cứng máy tính hoặc nạp nhanh 5 mẫu chuẩn sạch sẽ cho môi trường kiểm thử.
              </p>
            </div>

            {/* Offline Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleExportBackupOffline}
                disabled={exporting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm border border-slate-200/80 transition-all disabled:opacity-50 active:scale-[0.98] shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#0071E3]" />
                <span>{exporting ? 'Đang xuất tệp...' : 'Tải File JSON Về Máy'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm border border-slate-200/80 transition-all disabled:opacity-50 active:scale-[0.98] shadow-2xs"
              >
                <Upload className="w-4 h-4 text-[#0071E3]" />
                <span>{importing ? 'Đang đọc tệp...' : 'Nạp File JSON Từ Máy'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Reset to Default 5 Samples Button */}
            {onResetDefaultSamples && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#1D1D1F] block">Đặt lại dữ liệu 5 mẫu chuẩn</span>
                  <span className="text-[11px] text-[#86868B] block">Khôi phục 5 khách hàng, 5 đơn hàng và 5 bài viết mẫu chuẩn ban đầu.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Xác nhận khôi phục toàn bộ hệ thống về 5 mẫu chuẩn (Khách hàng, Đơn hàng, Bài viết)?')) {
                      onResetDefaultSamples()
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#1D1D1F] font-semibold text-xs rounded-2xl border border-slate-200 transition-all shadow-2xs active:scale-95 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Nạp 5 Mẫu Chuẩn</span>
                </button>
              </div>
            )}

            {importError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Preview Alert Box for Restore Offline */}
            {importPreview && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-amber-600" />
                    Xác Nhận Khôi Phục Dữ Liệu Ngoại Tuyến
                  </span>
                  <button
                    onClick={() => setImportPreview(null)}
                    className="text-xs text-amber-700 hover:text-amber-950 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  Tệp sao lưu chứa: <strong>{importPreview.customersCount}</strong> khách hàng,{' '}
                  <strong>{importPreview.ordersCount}</strong> đơn thi công,{' '}
                  <strong>{importPreview.postsCount}</strong> bài viết. Khôi phục sẽ đồng bộ dữ liệu vào hệ thống.
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleConfirmRestoreOffline}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition-colors"
                  >
                    Đồng Ý Khôi Phục Ngay
                  </button>
                  <button
                    onClick={() => setImportPreview(null)}
                    className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs border border-slate-200 font-semibold"
                  >
                    Hủy Bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password & Admin Accounts */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wider">
              <Key className="w-4 h-4" />
              <span>Bảo Mật Tài Khoản</span>
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] mt-1">
              Đổi Mật Khẩu Quản Trị
            </h3>
            <p className="text-xs text-[#86868B] mt-1">
              Đổi mật khẩu cho tài khoản <code className="text-[#0071E3] font-mono font-bold">admin</code> (Lập) hoặc tài khoản quản trị kỹ thuật <code className="text-[#0071E3] font-mono font-bold">admin1</code> (Tước).
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            {passwordMsg && (
              <div
                className={cn(
                  'p-3 rounded-2xl text-xs flex items-center gap-2 border font-medium',
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
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

            <div>
              <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Tài khoản cần đổi</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
              >
                <option value="admin">admin (Quản trị viên - Lập · 0967 611 112)</option>
                <option value="admin1">admin1 (Quản trị viên - Tước · 0796 785 151)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Mật khẩu hiện tại *</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang dùng"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Mật khẩu mới *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {passwordLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* Apple System & Business Identity Footer Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center gap-2.5 text-[#1D1D1F] font-bold text-sm">
          <div className="w-8 h-8 rounded-xl bg-yellow-50 text-[#B88700] flex items-center justify-center border border-yellow-200/60 shadow-2xs">
            <Shield className="w-4 h-4" />
          </div>
          <span>Thông Tin Doanh Nghiệp & Bản Quyền Hệ Thống</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px] font-medium">Đơn Vị Chủ Quản:</span>
            <span className="font-bold text-[#1D1D1F] mt-0.5 block">Công ty TNHH Công Nghệ An Ninh Huế</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px] font-medium">Mã Số Thuế Doanh Nghiệp:</span>
            <span className="font-mono font-bold text-[#1D1D1F] mt-0.5 block">3301677400 · Sở KH&ĐT TP. Huế</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px] font-medium">Hotline Quản Trị Trực 24/7:</span>
            <span className="font-bold text-[#0071E3] mt-0.5 block">0967 611 112 (Lập) · 0796 785 151 (Tước)</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px] font-medium">Phiên Bản Phần Mềm:</span>
            <span className="font-mono font-bold text-[#1D1D1F] mt-0.5 block">Camera247 Cloud Engine v2.5</span>
          </div>
        </div>
      </div>

      {/* Modal: Create Cloud Backup */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60 shadow-2xs">
                  <CloudUpload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">Tạo Bản Sao Lưu Đám Mây Mới</h3>
                  <p className="text-xs text-[#86868B]">Đẩy toàn bộ dữ liệu snapshot lên Supabase Database</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCloudBackup} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                  Tên Bản Sao Lưu Đám Mây *
                </label>
                <input
                  type="text"
                  required
                  value={newBackupName}
                  onChange={(e) => setNewBackupName(e.target.value)}
                  placeholder="VD: Snapshot Hoàn Thiện Dự Án Hương Giang Q1/2026"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] font-semibold focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                  Người Thực Hiện Sao Lưu
                </label>
                <select
                  value={creatorUser}
                  onChange={(e) => setCreatorUser(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] font-semibold focus:bg-white focus:outline-none focus:border-[#0071E3] transition-all"
                >
                  <option value="admin">Quản trị viên (Lập) · @admin</option>
                  <option value="admin1">Quản trị viên (Tước) · @admin1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                  Ghi Chú Tiến Độ / Nội Dung Snapshot
                </label>
                <textarea
                  rows={2}
                  value={newBackupNotes}
                  onChange={(e) => setNewBackupNotes(e.target.value)}
                  placeholder="VD: Bản sao lưu trước khi bàn giao đợt 2 cho khách hàng..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] transition-all resize-none"
                />
              </div>

              {/* Counts to be backed up */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <span className="font-bold block">📦 Dữ liệu sẽ đóng gói sao lưu:</span>
                <p>
                  • <strong>{customers.length}</strong> khách hàng • <strong>{orders.length}</strong> đơn hàng thi công •{' '}
                  <strong>{posts.length}</strong> bài viết công trình • <strong>{logs.length}</strong> bản ghi nhật ký.
                </p>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="submit"
                  disabled={creatingCloudBackup}
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {creatingCloudBackup ? 'Đang tải lên Đám Mây...' : 'Lưu Lên Đám Mây Ngay'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs sm:text-sm border border-slate-200 font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: SQL Editor Script */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">Câu Lệnh Supabase SQL Editor</h3>
                  <p className="text-xs text-[#86868B]">Tạo bảng cloud_backups lưu trữ snapshot đám mây trên Supabase</p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[#1D1D1F] text-xs leading-relaxed space-y-1">
                <span className="font-bold text-[#0071E3] block">💡 Hướng dẫn thực thi:</span>
                <p>1. Đăng nhập vào <strong>Supabase Dashboard</strong> dự án của bạn.</p>
                <p>2. Chọn mục <strong>SQL Editor</strong> ở thanh menu bên trái.</p>
                <p>3. Dán đoạn mã bên dưới và bấm nút <strong>RUN</strong>.</p>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed max-h-72 select-all">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Sao chép SQL
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 shrink-0">
              <button
                onClick={handleCopySql}
                className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Đã Sao Chép Lệnh' : 'Sao Chép Câu Lệnh SQL'}</span>
              </button>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2.5 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs font-semibold border border-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
