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
} from 'lucide-react'
import type { Customer, InstallationOrder, AccessLog } from '@/lib/camera247-data'
import type { Post, Category } from '@/lib/supabase'

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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-yellow-400" />
            Cài Đặt Hệ Thống & Sao Lưu Dữ Liệu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Xuất/nhập bản sao lưu JSON toàn hệ thống, đổi mật khẩu quản trị và quản lý tài nguyên.
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Backup & Restore Card */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Sao Lưu & Khôi Phục Dữ Liệu (JSON Export/Import)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tạo bản sao lưu toàn bộ đơn hàng thi công, danh bạ khách hàng, bài viết công trình và nhật ký hoạt động. File JSON có thể được lưu trữ ngoại tuyến hoặc khôi phục lại bất cứ lúc nào.
            </p>
          </div>

          {/* Current Counts Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-500 block">Khách hàng:</span>
              <span className="text-lg font-bold text-white font-mono">{customers.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Đơn thi công:</span>
              <span className="text-lg font-bold text-yellow-400 font-mono">{orders.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Bài viết:</span>
              <span className="text-lg font-bold text-blue-400 font-mono">{posts.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Nhật ký logs:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{logs.length}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              disabled={exporting}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Đang tạo bản sao lưu...' : 'Tải Về File Sao Lưu (.JSON)'}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm border border-slate-700 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-yellow-400" />
              {importing ? 'Đang đọc tệp...' : 'Khôi Phục Từ File (.JSON)'}
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
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Preview Modal for Restore */}
          {importPreview && (
            <div className="p-4 bg-slate-950 border border-yellow-400/40 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <FileJson className="w-4 h-4" />
                  Xác Nhận Khôi Phục Dữ Liệu
                </span>
                <button
                  onClick={() => setImportPreview(null)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Tệp sao lưu chứa: <strong>{importPreview.customersCount}</strong> khách hàng,{' '}
                <strong>{importPreview.ordersCount}</strong> đơn thi công,{' '}
                <strong>{importPreview.postsCount}</strong> bài viết. Khôi phục sẽ ghi đè dữ liệu hiện tại trên hệ thống.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleConfirmRestore}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Đồng Ý Khôi Phục Ngay
                </button>
                <button
                  onClick={() => setImportPreview(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                >
                  Hủy Bỏ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Change Password & Admin Accounts */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-400" />
              Đổi Mật Khẩu Quản Trị
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Đổi mật khẩu cho tài khoản quản trị chính (<code className="text-yellow-400 font-mono">admin</code>) hoặc tài khoản kỹ thuật viên (<code className="text-blue-400 font-mono">admin1</code>).
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Tài khoản cần đổi</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="admin">admin (Quản trị viên chính)</option>
                <option value="admin1">admin1 (Kỹ thuật viên 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Mật khẩu hiện tại *</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Mật khẩu mới *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
            >
              {passwordLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* System info box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Shield className="w-4 h-4 text-yellow-400" />
          Thông Tin Doanh Nghiệp & Hệ Thống Quản Trị
        </div>
        <p>• <strong>Đơn vị:</strong> Công ty TNHH Công Nghệ An Ninh Huế - Camera 247 Huế</p>
        <p>• <strong>Mã số thuế:</strong> 3301677400 · Sở KH&ĐT Thừa Thiên Huế</p>
        <p>• <strong>Kỹ thuật viên phụ trách:</strong> 0796 785 151 (Tước) · 0967 611 112 (Lập)</p>
        <p>• <strong>Phiên bản Dashboard:</strong> Camera247 Control Center v2.5 (3LMoto Engine Enhanced)</p>
      </div>
    </div>
  )
}
