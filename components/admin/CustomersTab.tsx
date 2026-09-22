'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Building,
  User,
  Shield,
  FileText,
  Calendar,
  DollarSign,
  X,
  Check,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react'
import { formatVND, formatDateVN } from '@/lib/formatters'
import type { Customer, InstallationOrder } from '@/lib/camera247-data'
import { ORDER_STATUS_CONFIG } from '@/lib/camera247-data'

interface CustomersTabProps {
  customers: Customer[]
  orders: InstallationOrder[]
  onSaveCustomer: (customer: Partial<Customer> & { id?: string }) => void
  onDeleteCustomer: (id: string) => void
  onOpenNewOrderWithCustomer?: (customer: Customer) => void
}

export function CustomersTab({
  customers,
  orders,
  onSaveCustomer,
  onDeleteCustomer,
  onOpenNewOrderWithCustomer,
}: CustomersTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'business'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'individual' as 'individual' | 'business',
    idcard: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')

  const openCreateModal = () => {
    setEditingCustomer(null)
    setFormData({
      name: '',
      phone: '',
      address: '',
      type: 'individual',
      idcard: '',
      notes: '',
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c)
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      address: c.address || '',
      type: c.type || 'individual',
      idcard: c.idcard || '',
      notes: c.notes || '',
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Vui lòng nhập tên và số điện thoại khách hàng.')
      return
    }

    onSaveCustomer({
      ...(editingCustomer ? { id: editingCustomer.id } : {}),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      type: formData.type,
      idcard: formData.idcard.trim(),
      notes: formData.notes.trim(),
    })

    setIsModalOpen(false)
  }

  // Filter & Search
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return customers.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      const matchType = typeFilter === 'all' || c.type === typeFilter
      return matchSearch && matchType
    })
  }, [customers, searchQuery, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE))
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredCustomers, currentPage])

  // Customer stats
  const customerStats = useMemo(() => {
    const total = customers.length
    const businesses = customers.filter((c) => c.type === 'business').length
    const individuals = customers.filter((c) => c.type === 'individual').length
    return { total, businesses, individuals }
  }, [customers])

  // Orders linked to viewing customer
  const viewingCustomerOrders = useMemo(() => {
    if (!viewingCustomer) return []
    return orders.filter(
      (o) => o.customer_id === viewingCustomer.id || o.customer_phone === viewingCustomer.phone
    )
  }, [orders, viewingCustomer])

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-yellow-400" />
            Quản Lý Hồ Sơ Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Danh bạ khách hàng cá nhân, cơ quan và doanh nghiệp lắp đặt thiết bị an ninh tại Thừa Thiên Huế.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Thêm Khách Hàng
        </button>
      </div>

      {/* 3 KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Tổng Khách Hàng</p>
            <p className="text-2xl font-black text-white">{customerStats.total}</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Hộ Gia Đình / Cá Nhân</p>
            <p className="text-2xl font-black text-white">{customerStats.individuals}</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Doanh Nghiệp / Khách Sạn</p>
            <p className="text-2xl font-black text-white">{customerStats.businesses}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
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
            placeholder="Tìm theo tên, số điện thoại, địa chỉ tại Huế..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTypeFilter('all')
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setTypeFilter('individual')
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Cá nhân
          </button>
          <button
            onClick={() => {
              setTypeFilter('business')
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'business'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Doanh nghiệp
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Tên Khách Hàng</th>
                <th className="py-3.5 px-4">Số Điện Thoại</th>
                <th className="py-3.5 px-4">Địa Chỉ</th>
                <th className="py-3.5 px-4">Loại Khách</th>
                <th className="py-3.5 px-4 text-right">Đơn Lắp Đặt</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Không tìm thấy khách hàng nào phù hợp với từ khóa.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust, idx) => {
                  const custOrders = orders.filter(
                    (o) => o.customer_id === cust.id || o.customer_phone === cust.phone
                  )
                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setViewingCustomer(cust)}
                          className="font-semibold text-white group-hover:text-yellow-400 transition-colors text-left font-sans"
                        >
                          {cust.name}
                        </button>
                        {cust.notes && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {cust.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        {cust.phone}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                        {cust.address || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            cust.type === 'business'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {cust.type === 'business' ? (
                            <>
                              <Building className="w-3 h-3" /> Doanh nghiệp
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3" /> Cá nhân
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                        {custOrders.length} đơn
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingCustomer(cust)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCustomerToDelete(cust)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              Trang {currentPage} / {totalPages} ({filteredCustomers.length} khách)
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121620] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E121A]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                {editingCustomer ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên Khách Hàng / Đơn Vị *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Khách sạn Hương Giang / Anh Long"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Số Điện Thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0914 xxx xxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Loại Khách Hàng
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="individual">Cá nhân / Hộ gia đình</option>
                    <option value="business">Doanh nghiệp / Khách sạn / Cơ quan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Địa Chỉ Tại Huế *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, Đường, Phường/Xã, TP. Huế"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi Chú Yêu Cầu / Thiết Bị Đã Lắp
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về nhu cầu giám sát, thời hạn bảo hành định kỳ, v.v."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md"
                >
                  {editingCustomer ? 'Cập Nhật Khách Hàng' : 'Tạo Khách Hàng'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs sm:text-sm border border-slate-700 font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail & Order History Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121620] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E121A] shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-yellow-400" />
                  Hồ Sơ Khách Hàng: {viewingCustomer.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  SĐT: <span className="font-mono text-yellow-400">{viewingCustomer.phone}</span> · {viewingCustomer.address}
                </p>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Info summary */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Phân loại:</span>
                  <span className="font-semibold text-white">
                    {viewingCustomer.type === 'business' ? 'Doanh nghiệp / Cơ quan' : 'Cá nhân / Gia đình'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tổng đơn thi công:</span>
                  <span className="font-semibold text-yellow-400 font-mono">
                    {viewingCustomerOrders.length} đơn
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tổng giá trị:</span>
                  <span className="font-semibold text-emerald-400 font-mono money">
                    {formatVND(
                      viewingCustomerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Linked Orders List */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                  Lịch Sử Các Đơn Hàng & Hợp Đồng Thi Công
                </h4>

                {viewingCustomerOrders.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
                    Khách hàng này chưa có đơn hàng thi công nào trong hệ thống.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {viewingCustomerOrders.map((ord) => {
                      const st = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending
                      return (
                        <div
                          key={ord.id}
                          className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-yellow-400">
                              {ord.order_code}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.badgeClass}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-white">
                            ⚙️ Thiết bị: {ord.equipment_list}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                            <span>Thi công: {ord.installation_date} · Bảo hành đến: {ord.warranty_until}</span>
                            <span className="font-mono font-bold text-white money">
                              {formatVND(ord.total_amount)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0E121A] shrink-0 flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121620] border border-rose-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xác Nhận Xóa Khách Hàng</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn có chắc muốn xóa hồ sơ khách hàng <strong className="text-white font-semibold">"{customerToDelete.name}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteCustomer(customerToDelete.id)
                  setCustomerToDelete(null)
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Xóa Vĩnh Viễn
              </button>
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
