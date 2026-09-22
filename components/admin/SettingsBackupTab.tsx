'use client'

import { useState, useRef } from 'react'
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
} from 'lucide-react'
import type { Customer, InstallationOrder, AccessLog } from '@/lib/camera247-data'
import type { Post, Category } from '@/lib/supabase'
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
}

export function SettingsBackupTab({
  customers,
  orders,
  posts,
  categories,
  logs,
  onRestoreData,
}: SettingsBackupTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
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

  // Handle JSON Export
  const handleExportBackup = () => {
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
      link.download = `camera247hue-backup-${dateTag}.json`
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

  // Confirm restore
  const handleConfirmRestore = () => {
    if (!importPreview?.rawData) return
    onRestoreData(importPreview.rawData)
    setImportPreview(null)
    alert('Khôi phục dữ liệu từ tệp sao lưu thành công!')
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
        setPasswordMsg({ type: 'success', text: `Đổi mật khẩu cho tài khoản @${username} thành công!` })
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
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] tracking-wide uppercase">
            <Settings className="w-4 h-4" />
            <span>Cấu Hình & Sao Lưu</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight mt-1">
            Cài Đặt Hệ Thống & Bảo Mật Dữ Liệu
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1">
            Xuất và khôi phục bản sao lưu JSON toàn hệ thống, quản lý mật khẩu tài khoản quản trị và bảo mật.
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Backup & Restore Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Snapshot JSON</span>
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] mt-1">
              Sao Lưu & Khôi Phục Dữ Liệu Ngoại Tuyến
            </h3>
            <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
              Tạo tệp sao lưu JSON chứa toàn bộ dữ liệu khách hàng, đơn thi công, bài viết và lịch sử truy cập để lưu trữ an toàn hoặc chuyển đổi thiết bị.
            </p>
          </div>

          {/* Current Counts Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-[#86868B] block">Khách hàng:</span>
              <span className="text-lg font-bold text-[#1D1D1F] font-mono tabular-nums">{customers.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#86868B] block">Đơn thi công:</span>
              <span className="text-lg font-bold text-[#0071E3] font-mono tabular-nums">{orders.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#86868B] block">Bài viết:</span>
              <span className="text-lg font-bold text-amber-600 font-mono tabular-nums">{posts.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#86868B] block">Nhật ký logs:</span>
              <span className="text-lg font-bold text-emerald-600 font-mono tabular-nums">{logs.length}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={handleExportBackup}
              disabled={exporting}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Đang xuất tệp...' : 'Tải Về Tệp Sao Lưu (.JSON)'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] font-semibold py-3 px-4 rounded-2xl text-xs sm:text-sm border border-slate-200/80 transition-all disabled:opacity-50 active:scale-[0.98] shadow-2xs"
            >
              <Upload className="w-4 h-4 text-[#0071E3]" />
              <span>{importing ? 'Đang đọc tệp...' : 'Khôi Phục Từ File (.JSON)'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {importError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Preview Alert Box for Restore */}
          {importPreview && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-amber-600" />
                  Xác Nhận Khôi Phục Dữ Liệu Hệ Thống
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
                <strong>{importPreview.postsCount}</strong> bài viết. Khôi phục sẽ đồng bộ và ghi đè dữ liệu trên trình duyệt này.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleConfirmRestore}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition-colors"
                >
                  Đồng Ý Khôi Phục Ngay
                </button>
                <button
                  onClick={() => setImportPreview(null)}
                  className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs border border-slate-200"
                >
                  Hủy Bỏ
                </button>
              </div>
            </div>
          )}
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
              Đổi mật khẩu cho tài khoản <code className="text-[#0071E3] font-mono font-semibold">admin</code> hoặc tài khoản kỹ thuật <code className="text-[#0071E3] font-mono font-semibold">admin1</code>.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            {passwordMsg && (
              <div
                className={cn(
                  'p-3 rounded-2xl text-xs flex items-center gap-2 border',
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
              <label className="block text-[11px] font-medium text-[#86868B] mb-1">Tài khoản cần đổi</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              >
                <option value="admin">admin (Quản trị viên chính)</option>
                <option value="admin1">admin1 (Kỹ thuật viên 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868B] mb-1">Mật khẩu hiện tại *</label>
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
              <label className="block text-[11px] font-medium text-[#86868B] mb-1">Mật khẩu mới *</label>
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
              <label className="block text-[11px] font-medium text-[#86868B] mb-1">Xác nhận mật khẩu mới *</label>
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
              className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-2.5 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {passwordLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* Apple System & Business Identity Footer Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center gap-2.5 text-[#1D1D1F] font-bold text-sm">
          <div className="w-8 h-8 rounded-xl bg-yellow-50 text-[#B88700] flex items-center justify-center border border-yellow-200/60">
            <Shield className="w-4 h-4" />
          </div>
          <span>Thông Tin Doanh Nghiệp & Bản Quyền Hệ Thống</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px]">Đơn Vị Chủ Quản:</span>
            <span className="font-semibold text-[#1D1D1F] mt-0.5 block">Công ty TNHH Công Nghệ An Ninh Huế</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px]">Mã Số Thuế Doanh Nghiệp:</span>
            <span className="font-mono font-semibold text-[#1D1D1F] mt-0.5 block">3301677400 · Sở KH&ĐT TT Huế</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px]">Hotline Kỹ Thuật Trực 24/7:</span>
            <span className="font-semibold text-[#0071E3] mt-0.5 block">0796 785 151 (Tước) · 0967 611 112 (Lập)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[#86868B] block text-[11px]">Phiên Bản Phần Mềm:</span>
            <span className="font-mono font-semibold text-[#1D1D1F] mt-0.5 block">Camera247 macOS Engine v2.5</span>
          </div>
        </div>
      </div>
    </div>
  )
}
