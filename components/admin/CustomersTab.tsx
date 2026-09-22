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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 sm:p-7 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1D1D1F] tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0071E3]" />
            Hồ Sơ & Danh Bạ Khách Hàng
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#86868B] mt-1">
            Quản lý danh sách khách hàng cá nhân, cơ quan và doanh nghiệp tại Thừa Thiên Huế.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_10px_rgba(0,113,227,0.28)] transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Thêm Khách Hàng
        </button>
      </div>

      {/* 3 KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider">Tổng Khách Hàng</p>
            <p className="text-2xl font-bold text-[#1D1D1F] font-tabular">{customerStats.total}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider">Hộ Gia Đình / Cá Nhân</p>
            <p className="text-2xl font-bold text-[#1D1D1F] font-tabular">{customerStats.individuals}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider">Doanh Nghiệp / Khách Sạn</p>
            <p className="text-2xl font-bold text-[#1D1D1F] font-tabular">{customerStats.businesses}</p>
          </div>
        </div>
      </div>

      {/* Apple Segmented Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm theo tên, số điện thoại, địa chỉ tại Huế..."
            className="w-full bg-slate-50/80 border border-slate-200/80 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all"
          />
        </div>

        {/* Apple Segmented Control */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl shrink-0 border border-slate-200/60">
          <button
            onClick={() => {
              setTypeFilter('all')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'all'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setTypeFilter('individual')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'individual'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            Cá nhân
          </button>
          <button
            onClick={() => {
              setTypeFilter('business')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'business'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            Doanh nghiệp
          </button>
        </div>
      </div>

      {/* Clean Apple Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Tên Khách Hàng</th>
                <th className="py-3.5 px-4">Số Điện Thoại</th>
                <th className="py-3.5 px-4">Địa Chỉ</th>
                <th className="py-3.5 px-4">Phân Loại</th>
                <th className="py-3.5 px-4 text-right">Đơn Lắp Đặt</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#424245]">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#86868B]">
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
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center text-[#86868B] font-mono">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setViewingCustomer(cust)}
                          className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors text-left"
                        >
                          {cust.name}
                        </button>
                        {cust.notes && (
                          <p className="text-[11px] text-[#86868B] line-clamp-1 mt-0.5">
                            {cust.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#1D1D1F]">
                        {cust.phone}
                      </td>
                      <td className="py-3.5 px-4 text-[#424245] max-w-[200px] truncate">
                        {cust.address || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            cust.type === 'business'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
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
                      <td className="py-3.5 px-4 text-right font-bold text-[#1D1D1F] font-tabular">
                        {custOrders.length} đơn
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingCustomer(cust)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0071E3] hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCustomerToDelete(cust)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#86868B]">
            <span>
              Trang {currentPage} / {totalPages} ({filteredCustomers.length} khách)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-[#1D1D1F] font-medium"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-[#1D1D1F] font-medium"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal (iOS Sheet Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0071E3]" />
                {editingCustomer ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Tên Khách Hàng / Đơn Vị *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Khách sạn Hương Giang / Anh Long"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Số Điện Thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0914 xxx xxx"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Loại Khách Hàng
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] transition-all"
                  >
                    <option value="individual">Cá nhân / Hộ gia đình</option>
                    <option value="business">Doanh nghiệp / Khách sạn / Cơ quan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Địa Chỉ Tại Huế *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, Đường, Phường/Xã, TP. Huế"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Ghi Chú Yêu Cầu / Thiết Bị Đã Lắp
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về nhu cầu giám sát, thời hạn bảo hành định kỳ, v.v."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] transition-all resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                >
                  {editingCustomer ? 'Cập Nhật Khách Hàng' : 'Tạo Khách Hàng'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs sm:text-sm border border-slate-200 font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal (iOS Sheet Style) */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0071E3]" />
                  Hồ Sơ Khách Hàng: {viewingCustomer.name}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  SĐT: <span className="font-mono text-[#0071E3] font-semibold">{viewingCustomer.phone}</span> · {viewingCustomer.address}
                </p>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Info summary */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#86868B] block">Phân loại:</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {viewingCustomer.type === 'business' ? 'Doanh nghiệp / Cơ quan' : 'Cá nhân / Gia đình'}
                  </span>
                </div>
                <div>
                  <span className="text-[#86868B] block">Tổng đơn thi công:</span>
                  <span className="font-semibold text-[#0071E3] font-mono">
                    {viewingCustomerOrders.length} đơn
                  </span>
                </div>
                <div>
                  <span className="text-[#86868B] block">Tổng giá trị:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {formatVND(
                      viewingCustomerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Linked Orders List */}
              <div>
                <h4 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#0071E3]" />
                  Lịch Sử Các Đơn Hàng & Hợp Đồng Thi Công
                </h4>

                {viewingCustomerOrders.length === 0 ? (
                  <div className="p-6 text-center text-[#86868B] text-xs bg-slate-50 rounded-2xl border border-slate-200">
                    Khách hàng này chưa có đơn hàng thi công nào trong hệ thống.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {viewingCustomerOrders.map((ord) => {
                      const st = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending
                      return (
                        <div
                          key={ord.id}
                          className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#0071E3]">
                              {ord.order_code}
                            </span>
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#1D1D1F]">
                            ⚙️ Thiết bị: {ord.equipment_list}
                          </p>
                          <div className="flex items-center justify-between text-[11.5px] text-[#86868B] border-t border-slate-100 pt-2">
                            <span>Thi công: {ord.installation_date} · Bảo hành đến: {ord.warranty_until}</span>
                            <span className="font-mono font-bold text-[#1D1D1F]">
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

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">Xác Nhận Xóa Khách Hàng</h3>
              <p className="text-xs text-[#86868B] mt-1">
                Bạn có chắc muốn xóa hồ sơ khách hàng <strong className="text-[#1D1D1F]">"{customerToDelete.name}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteCustomer(customerToDelete.id)
                  setCustomerToDelete(null)
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-2xl text-xs transition-colors"
              >
                Xóa Vĩnh Viễn
              </button>
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-medium"
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
