'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ClipboardList,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Phone,
  MapPin,
  User,
  Shield,
  Check,
  AlertTriangle,
  FileText,
  Camera,
  Lock,
  Wifi,
  Bell,
  Fingerprint,
  Server,
  Sparkles,
} from 'lucide-react'
import {
  formatVND,
  formatNumber,
  parseVND,
  formatDateVN,
  calculateWarrantyEnd,
  isWarrantyActive,
} from '@/lib/formatters'
import type { Customer, InstallationOrder } from '@/lib/camera247-data'
import {
  CAMERA247_SERVICES,
  ORDER_STATUS_CONFIG,
} from '@/lib/camera247-data'

interface OrdersTabProps {
  orders: InstallationOrder[]
  customers: Customer[]
  onSaveOrder: (order: Partial<InstallationOrder> & { id?: string }) => void
  onDeleteOrder: (id: string) => void
  initialNewOrderCustomer?: Customer | null
}

export function OrdersTab({
  orders,
  customers,
  onSaveOrder,
  onDeleteOrder,
  initialNewOrderCustomer,
}: OrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<InstallationOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<InstallationOrder | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<InstallationOrder | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  // Form State
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    services: ['camera'] as string[],
    equipment_list: '',
    installation_date: new Date().toLocaleDateString('vi-VN'),
    completion_date: '',
    warranty_months: 24,
    warranty_until: '',
    total_amount_str: '0',
    deposit_amount_str: '0',
    status: 'in_progress' as InstallationOrder['status'],
    technician: 'Lập & Tước',
    notes: '',
  })
  const [customerSearch, setCustomerSearch] = useState('')
  const [formError, setFormError] = useState('')

  const openCreateModal = (prefillCustomer?: Customer | null) => {
    setEditingOrder(null)
    const today = new Date()
    const todayVN = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    const defaultWarrantyEnd = calculateWarrantyEnd(todayVN, 24)

    setFormData({
      customer_id: prefillCustomer?.id || '',
      customer_name: prefillCustomer?.name || '',
      customer_phone: prefillCustomer?.phone || '',
      customer_address: prefillCustomer?.address || '',
      services: ['camera'],
      equipment_list: 'Trọn gói 04 Camera Full Color 4MP Dahua + Ổ cứng 1TB + Phụ kiện thi công',
      installation_date: todayVN,
      completion_date: '',
      warranty_months: 24,
      warranty_until: defaultWarrantyEnd,
      total_amount_str: '8.500.000',
      deposit_amount_str: '3.000.000',
      status: 'in_progress',
      technician: 'Lập & Tước',
      notes: 'Bảo hành tận nơi tại Huế trong 24 tháng',
    })
    setCustomerSearch(prefillCustomer?.name || '')
    setFormError('')
    setIsModalOpen(true)
  }

  // Auto-open create modal if initial customer is provided from Customer Tab
  useEffect(() => {
    if (initialNewOrderCustomer) {
      openCreateModal(initialNewOrderCustomer)
    }
  }, [initialNewOrderCustomer])

  const openEditModal = (order: InstallationOrder) => {
    setEditingOrder(order)
    setFormData({
      customer_id: order.customer_id || '',
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || '',
      customer_address: order.customer_address || '',
      services: order.services || ['camera'],
      equipment_list: order.equipment_list || '',
      installation_date: order.installation_date || '',
      completion_date: order.completion_date || '',
      warranty_months: order.warranty_months || 24,
      warranty_until: order.warranty_until || '',
      total_amount_str: formatNumber(order.total_amount),
      deposit_amount_str: formatNumber(order.deposit_amount),
      status: order.status || 'in_progress',
      technician: order.technician || 'Lập & Tước',
      notes: order.notes || '',
    })
    setCustomerSearch(order.customer_name || '')
    setFormError('')
    setIsModalOpen(true)
  }

  // Handle service toggle
  const toggleService = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(serviceId)
      const nextServices = exists
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId]
      return {
        ...prev,
        services: nextServices.length > 0 ? nextServices : [serviceId],
      }
    })
  }

  // Handle warranty duration change
  const handleWarrantyChange = (months: number) => {
    const end = calculateWarrantyEnd(formData.installation_date, months)
    setFormData((prev) => ({
      ...prev,
      warranty_months: months,
      warranty_until: end,
    }))
  }

  // Handle installation date change
  const handleInstallationDateChange = (dateVal: string) => {
    const end = calculateWarrantyEnd(dateVal, formData.warranty_months)
    setFormData((prev) => ({
      ...prev,
      installation_date: dateVal,
      warranty_until: end,
    }))
  }

  // Handle customer selection from dropdown
  const handleSelectCustomer = (c: Customer) => {
    setFormData((prev) => ({
      ...prev,
      customer_id: c.id,
      customer_name: c.name,
      customer_phone: c.phone,
      customer_address: c.address,
    }))
    setCustomerSearch(c.name)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      setFormError('Vui lòng nhập tên và số điện thoại khách hàng.')
      return
    }

    const totalVal = parseVND(formData.total_amount_str)
    const depositVal = parseVND(formData.deposit_amount_str)

    onSaveOrder({
      ...(editingOrder ? { id: editingOrder.id, order_code: editingOrder.order_code } : {}),
      customer_id: formData.customer_id,
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_address: formData.customer_address.trim(),
      services: formData.services,
      equipment_list: formData.equipment_list.trim(),
      installation_date: formData.installation_date.trim(),
      completion_date: formData.completion_date.trim(),
      warranty_months: formData.warranty_months,
      warranty_until: formData.warranty_until.trim(),
      total_amount: totalVal,
      deposit_amount: depositVal,
      status: formData.status,
      technician: formData.technician.trim(),
      notes: formData.notes.trim(),
    })

    setIsModalOpen(false)
  }

  // Filter orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        o.customer_address.toLowerCase().includes(q) ||
        o.equipment_list.toLowerCase().includes(q)

      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      const matchService = serviceFilter === 'all' || (o.services || []).includes(serviceFilter)

      return matchSearch && matchStatus && matchService
    })
  }, [orders, searchQuery, statusFilter, serviceFilter])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

  // Filtered customer autocomplete
  const matchedCustomers = useMemo(() => {
    if (!customerSearch || customerSearch.length < 2) return []
    const q = customerSearch.toLowerCase()
    return customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 5)
  }, [customers, customerSearch])

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 sm:p-7 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1D1D1F] tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-[#0071E3]" />
            Đơn Hàng & Hợp Đồng Thi Công
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#86868B] mt-1">
            Theo dõi chi tiết đơn thi công camera, khóa vân tay, mạng wifi, phụ kiện và bảo hành.
          </p>
        </div>

        <button
          onClick={() => openCreateModal(initialNewOrderCustomer)}
          className="flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_10px_rgba(0,113,227,0.28)] transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tạo Đơn Thi Công Mới
        </button>
      </div>

      {/* Apple Pill Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Tất cả', count: orders.length },
          { id: 'in_progress', label: 'Đang thi công', count: orders.filter((o) => o.status === 'in_progress').length },
          { id: 'pending', label: 'Chờ thi công', count: orders.filter((o) => o.status === 'pending').length },
          { id: 'survey', label: 'Khảo sát / Báo giá', count: orders.filter((o) => o.status === 'survey').length },
          { id: 'warranty', label: 'Đang bảo hành', count: orders.filter((o) => o.status === 'warranty').length },
          { id: 'completed', label: 'Đã hoàn thành', count: orders.filter((o) => o.status === 'completed').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id)
              setCurrentPage(1)
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
              statusFilter === tab.id
                ? 'bg-[#0071E3] border-[#0071E3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]'
                : 'bg-white border-slate-200/80 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-tabular font-bold ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#86868B]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Service Filter Toolbar */}
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
            placeholder="Tìm theo mã đơn (C247-...), tên khách, SĐT, thiết bị..."
            className="w-full bg-slate-50/80 border border-slate-200/80 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-50/80 border border-slate-200/80 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all"
          >
            <option value="all">Tất cả dịch vụ</option>
            {CAMERA247_SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Khách Hàng & Địa Chỉ</th>
                <th className="py-3.5 px-4">Dịch Vụ & Thiết Bị</th>
                <th className="py-3.5 px-4">Ngày Thi Công</th>
                <th className="py-3.5 px-4">Bảo Hành</th>
                <th className="py-3.5 px-4 text-right">Trị Giá</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#424245]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#86868B]">
                    Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const remainingAmount = Math.max(0, (ord.total_amount || 0) - (ord.deposit_amount || 0))
                  const warrantyInfo = isWarrantyActive(ord.warranty_until)

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#0071E3] text-xs block">
                          {ord.order_code}
                        </span>
                        <span className="text-[10.5px] text-[#86868B] font-mono">
                          KTV: {ord.technician || 'C247'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors truncate">
                          {ord.customer_name}
                        </p>
                        <p className="text-[11px] text-[#86868B] font-mono">
                          📞 {ord.customer_phone}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate mt-0.5">
                          📍 {ord.customer_address}
                        </p>
                      </td>

                      {/* Services & Equipment */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(ord.services || []).map((sId) => {
                            const sDef = CAMERA247_SERVICES.find((s) => s.id === sId)
                            if (!sDef) return null
                            return (
                              <span
                                key={sId}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200`}
                              >
                                {sDef.name.split('/')[0].trim()}
                              </span>
                            )
                          })}
                        </div>
                        <p className="text-[11.5px] text-[#6E6E73] line-clamp-2 leading-relaxed">
                          {ord.equipment_list}
                        </p>
                      </td>

                      {/* Installation Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[#1D1D1F] font-medium block">
                          {ord.installation_date || '—'}
                        </span>
                        {ord.completion_date && (
                          <span className="text-[10.5px] text-emerald-600 block font-semibold">
                            Bàn giao: {ord.completion_date}
                          </span>
                        )}
                      </td>

                      {/* Warranty */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[#1D1D1F] font-mono font-semibold">
                          {ord.warranty_months} tháng
                        </div>
                        {ord.warranty_until && (
                          <div
                            className={`text-[10px] font-mono mt-0.5 ${
                              warrantyInfo.active ? 'text-indigo-600' : 'text-slate-400 line-through'
                            }`}
                          >
                            Đến: {ord.warranty_until}
                          </div>
                        )}
                      </td>

                      {/* Total & Deposit */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-[#1D1D1F] text-xs block font-tabular">
                          {formatVND(ord.total_amount)}
                        </span>
                        {remainingAmount > 0 ? (
                          <span className="text-[10px] text-amber-600 font-mono font-medium">
                            Còn lại: {formatVND(remainingAmount)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            Đã thanh toán đủ
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                            ord.status === 'in_progress'
                              ? 'bg-blue-50 text-[#0071E3] border-blue-200'
                              : ord.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'warranty'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${ord.status === 'in_progress' ? 'bg-[#0071E3] animate-pulse' : 'bg-current'}`} />
                          {ord.status === 'in_progress'
                            ? 'Đang thi công'
                            : ord.status === 'completed'
                            ? 'Đã bàn giao'
                            : ord.status === 'warranty'
                            ? 'Đang bảo hành'
                            : ord.status === 'survey'
                            ? 'Khảo sát / Báo giá'
                            : ord.status === 'pending'
                            ? 'Chờ thi công'
                            : 'Đã hủy'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0071E3] hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết & In phiếu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(ord)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(ord)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa đơn"
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
              Trang {currentPage} / {totalPages} ({filteredOrders.length} đơn hàng)
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

      {/* Add / Edit Order Modal (iOS Sheet Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#0071E3]" />
                  {editingOrder
                    ? `Chỉnh Sửa Đơn Hàng: ${editingOrder.order_code}`
                    : 'Tạo Đơn Hàng Thi Công & Bảo Hành Mới'}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Nhập thông tin khách hàng, gói dịch vụ, thiết bị, giá trị và thời hạn bảo hành.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              {/* 1. Services Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
                  1. Lựa Chọn Gói Dịch Vụ Lắp Đặt *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CAMERA247_SERVICES.map((serv) => {
                    const isSelected = formData.services.includes(serv.id)
                    return (
                      <button
                        key={serv.id}
                        type="button"
                        onClick={() => toggleService(serv.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 text-[#0071E3] shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-[#0071E3] border-[#0071E3] text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold leading-snug">{serv.name}</p>
                          <p className="text-[10.5px] text-[#86868B] mt-0.5">{serv.category}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Customer Selection / Input */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
                  2. Thông Tin Khách Hàng Tại Huế *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Tên khách hàng / Đơn vị *</label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => {
                        setFormData({ ...formData, customer_name: e.target.value })
                        setCustomerSearch(e.target.value)
                      }}
                      placeholder="VD: Khách sạn Hương Giang..."
                      className="w-full bg-white border border-slate-200 focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all"
                    />

                    {/* Autocomplete dropdown */}
                    {matchedCustomers.length > 0 && customerSearch !== formData.customer_name && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                        {matchedCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCustomer(c)}
                            className="p-2.5 hover:bg-blue-50/50 cursor-pointer text-xs transition-colors"
                          >
                            <p className="font-semibold text-[#1D1D1F]">{c.name}</p>
                            <p className="text-[11px] text-[#86868B]">{c.phone} · {c.address}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="0914 xxx xxx"
                      className="w-full bg-white border border-slate-200 focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Địa chỉ thi công tại Huế *</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    placeholder="Số nhà, Đường, Phường, TP. Huế"
                    className="w-full bg-white border border-slate-200 focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all"
                  />
                </div>
              </div>

              {/* 3. Equipment details */}
              <div>
                <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                  3. Danh Sách Thiết Bị & Cấu Hình Thi Công *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.equipment_list}
                  onChange={(e) => setFormData({ ...formData, equipment_list: e.target.value })}
                  placeholder="VD: 04 Camera Dahua IP 4MP Full Color + Đầu ghi NVR 4 kênh + Ổ cứng 1TB Seagate + 01 Switch PoE..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] transition-all resize-none"
                />
              </div>

              {/* 4. Dates & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Ngày thi công *</label>
                  <input
                    type="text"
                    required
                    value={formData.installation_date}
                    onChange={(e) => handleInstallationDateChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-white border border-slate-200 focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs text-[#1D1D1F] transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Thời hạn bảo hành</label>
                  <select
                    value={formData.warranty_months}
                    onChange={(e) => handleWarrantyChange(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-200 focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs text-[#1D1D1F] transition-all"
                  >
                    <option value={12}>12 Tháng (1 Năm)</option>
                    <option value={24}>24 Tháng (2 Năm - Tiêu chuẩn)</option>
                    <option value={36}>36 Tháng (3 Năm)</option>
                    <option value={48}>48 Tháng (4 Năm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Hết hạn bảo hành</label>
                  <input
                    type="text"
                    value={formData.warranty_until}
                    onChange={(e) => setFormData({ ...formData, warranty_until: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-white border border-slate-200 focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs text-[#0071E3] font-semibold transition-all font-mono"
                  />
                </div>
              </div>

              {/* 5. Pricing & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Tổng giá trị đơn (VNĐ) *</label>
                  <input
                    type="text"
                    required
                    value={formData.total_amount_str}
                    onChange={(e) => setFormData({ ...formData, total_amount_str: e.target.value })}
                    placeholder="8.500.000"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] font-bold transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Tạm ứng / Đặt cọc (VNĐ)</label>
                  <input
                    type="text"
                    value={formData.deposit_amount_str}
                    onChange={(e) => setFormData({ ...formData, deposit_amount_str: e.target.value })}
                    placeholder="3.000.000"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Trạng thái thi công</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] transition-all"
                  >
                    <option value="survey">Khảo sát / Báo giá</option>
                    <option value="pending">Chờ thi công</option>
                    <option value="in_progress">Đang thi công</option>
                    <option value="completed">Đã bàn giao</option>
                    <option value="warranty">Đang bảo hành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* 6. Technician & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Kỹ thuật viên phụ trách</label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    placeholder="Lập & Tước / Đội KTV"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs text-[#1D1D1F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Ghi chú thi công / Bàn giao</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về vị trí lắp, dây nguồn..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-3 py-2 text-xs text-[#1D1D1F] transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                >
                  {editingOrder ? 'Lưu Thay Đổi Đơn Hàng' : 'Tạo Đơn Hàng Thi Công'}
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

      {/* Order Detail & Print View Modal (iOS Sheet Style) */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0071E3]" />
                  Phiếu Lắp Đặt & Bảo Hành: {viewingOrder.order_code}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Công ty TNHH Công Nghệ An Ninh Huế - Camera247 Huế
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  title="In phiếu"
                >
                  <Printer className="w-4 h-4" /> In Phiếu
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-6 overflow-y-auto space-y-5 bg-white text-slate-900 rounded-b-xl print:m-0 print:p-0">
              {/* Brand Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                    CÔNG TY TNHH CÔNG NGHỆ AN NINH HUẾ
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    Thương hiệu: Camera 247 Huế · MST: 3301677400
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hotline kỹ thuật: 0796 785 151 (Tước) · 0967 611 112 (Lập)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Website: camera247hue.com · Địa chỉ: TP. Huế
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded-lg">
                    {viewingOrder.order_code}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ngày: {viewingOrder.installation_date}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h3 className="text-base font-bold uppercase tracking-wider text-slate-950">
                  PHIẾU BÀN GIAO THI CÔNG & CAM KẾT BẢO HÀNH
                </h3>
              </div>

              {/* Customer Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    <strong className="text-slate-700">Khách hàng:</strong>{' '}
                    <span className="font-semibold text-slate-950">{viewingOrder.customer_name}</span>
                  </p>
                  <p>
                    <strong className="text-slate-700">Điện thoại:</strong>{' '}
                    <span className="font-mono font-semibold text-slate-950">{viewingOrder.customer_phone}</span>
                  </p>
                </div>
                <p>
                  <strong className="text-slate-700">Địa chỉ thi công:</strong>{' '}
                  <span className="text-slate-900">{viewingOrder.customer_address}</span>
                </p>
                <p>
                  <strong className="text-slate-700">Kỹ thuật viên phụ trách:</strong>{' '}
                  <span className="text-slate-900">{viewingOrder.technician || 'Camera 247 Huế'}</span>
                </p>
              </div>

              {/* Equipment list */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  Danh mục thiết bị & giải pháp đã lắp đặt:
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {viewingOrder.equipment_list}
                </div>
              </div>

              {/* Pricing & Warranty Terms */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900 uppercase">Chính Sách Bảo Hành</p>
                  <p>• Thời hạn: <strong className="text-blue-700">{viewingOrder.warranty_months} tháng</strong></p>
                  <p>• Hạn bảo hành: <strong className="text-indigo-700 font-mono">{viewingOrder.warranty_until}</strong></p>
                  <p className="text-[11px] text-slate-500">• Bảo hành tận nơi 24/7 khi có sự cố kỹ thuật.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-right">
                  <p className="font-bold text-slate-900 uppercase text-left">Thanh Toán</p>
                  <p>
                    Tổng trị giá:{' '}
                    <strong className="font-mono text-sm text-slate-950">
                      {formatVND(viewingOrder.total_amount)}
                    </strong>
                  </p>
                  <p>
                    Đã thanh toán / Cọc:{' '}
                    <span className="font-mono font-semibold text-emerald-700">
                      {formatVND(viewingOrder.deposit_amount)}
                    </span>
                  </p>
                  <p>
                    Còn lại:{' '}
                    <strong className="font-mono text-amber-700">
                      {formatVND(Math.max(0, viewingOrder.total_amount - viewingOrder.deposit_amount))}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Signature section */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-900 uppercase">Đại Diện Khách Hàng</p>
                  <p className="text-[11px] text-slate-500 italic mt-1">(Ký & ghi rõ họ tên)</p>
                  <div className="h-16" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 uppercase">Đại Diện Camera 247 Huế</p>
                  <p className="text-[11px] text-slate-500 italic mt-1">(Kỹ thuật viên nghiệm thu)</p>
                  <div className="h-16 flex items-center justify-center font-bold text-blue-800">
                    Camera 247 Huế
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-2">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">Xác Nhận Xóa Đơn Hàng</h3>
              <p className="text-xs text-[#86868B] mt-1">
                Bạn có chắc muốn xóa đơn hàng <strong className="text-[#0071E3] font-mono">{orderToDelete.order_code}</strong> ({orderToDelete.customer_name}) không?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteOrder(orderToDelete.id)
                  setOrderToDelete(null)
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-2xl text-xs transition-colors"
              >
                Xóa Vĩnh Viễn
              </button>
              <button
                onClick={() => setOrderToDelete(null)}
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
