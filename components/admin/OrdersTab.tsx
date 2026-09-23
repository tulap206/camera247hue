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
  PhoneCall,
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
  Download,
  MessageCircle,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Filter,
  Wrench,
  Receipt,
  BadgeAlert,
  RefreshCw,
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
import { cn } from '@/lib/utils'
import PaginationControl from './PaginationControl'

interface OrdersTabProps {
  orders: InstallationOrder[]
  customers: Customer[]
  onSaveOrder: (order: Partial<InstallationOrder> & { id?: string }) => void
  onDeleteOrder: (id: string) => void
  initialNewOrderCustomer?: Customer | null
  onRefreshData?: () => void
}

type PaymentFilterOption = 'all' | 'paid' | 'unpaid'
type SortOrderOption = 'newest' | 'amount_desc' | 'date_asc'

export function OrdersTab({
  orders,
  customers,
  onSaveOrder,
  onDeleteOrder,
  initialNewOrderCustomer,
  onRefreshData,
}: OrdersTabProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterOption>('all')
  const [sortBy, setSortBy] = useState<SortOrderOption>('newest')
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
      equipment_list: 'Trọn gói 04 Camera Full Color 4MP Dahua AI + Ổ cứng 1TB Seagate + Switch PoE và phụ kiện thi công',
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

  // Quick status updater from table
  const handleQuickStatusChange = (order: InstallationOrder, nextStatus: InstallationOrder['status']) => {
    onSaveOrder({
      id: order.id,
      order_code: order.order_code,
      status: nextStatus,
      completion_date: nextStatus === 'completed' || nextStatus === 'warranty'
        ? order.completion_date || new Date().toLocaleDateString('vi-VN')
        : order.completion_date,
    })
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

  // Export orders list to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'Mã Đơn Hàng',
        'Tên Khách Hàng',
        'Số Điện Thoại',
        'Địa Chỉ Thi Công',
        'Gói Dịch Vụ',
        'Danh Mục Thiết Bị',
        'Ngày Thi Công',
        'Ngày Bàn Giao',
        'Thời Hạn Bảo Hành (Tháng)',
        'Hạn Bảo Hành Đến',
        'Tổng Tiền (VND)',
        'Đã Cọc / Thanh Toán (VND)',
        'Còn Lại (VND)',
        'Trạng Thái',
        'Kỹ Thuật Viên Phụ Trách',
        'Ghi Chú',
      ]

      const rows = filteredOrders.map((o) => {
        const remaining = Math.max(0, (o.total_amount || 0) - (o.deposit_amount || 0))
        const statusLabel = ORDER_STATUS_CONFIG[o.status]?.label || o.status
        const servicesText = (o.services || [])
          .map((sId) => CAMERA247_SERVICES.find((s) => s.id === sId)?.name || sId)
          .join('; ')

        return [
          `"${o.order_code}"`,
          `"${(o.customer_name || '').replace(/"/g, '""')}"`,
          `"${o.customer_phone || ''}"`,
          `"${(o.customer_address || '').replace(/"/g, '""')}"`,
          `"${servicesText}"`,
          `"${(o.equipment_list || '').replace(/"/g, '""')}"`,
          `"${o.installation_date || ''}"`,
          `"${o.completion_date || ''}"`,
          o.warranty_months || 24,
          `"${o.warranty_until || ''}"`,
          o.total_amount || 0,
          o.deposit_amount || 0,
          remaining,
          `"${statusLabel}"`,
          `"${(o.technician || '').replace(/"/g, '""')}"`,
          `"${(o.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      })

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const dateTag = new Date().toISOString().split('T')[0]
      link.href = url
      link.download = `danh-sach-don-hang-camera247-${dateTag}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert('Lỗi xuất file CSV: ' + err.message)
    }
  }

  // Filter & Sort Orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return orders
      .filter((o) => {
        const matchSearch =
          !q ||
          o.order_code.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q) ||
          o.customer_address.toLowerCase().includes(q) ||
          o.equipment_list.toLowerCase().includes(q) ||
          o.technician.toLowerCase().includes(q)

        const matchStatus = statusFilter === 'all' || o.status === statusFilter
        const matchService = serviceFilter === 'all' || (o.services || []).includes(serviceFilter)

        let matchPayment = true
        const remaining = (o.total_amount || 0) - (o.deposit_amount || 0)
        if (paymentFilter === 'paid') matchPayment = remaining <= 0
        else if (paymentFilter === 'unpaid') matchPayment = remaining > 0

        return matchSearch && matchStatus && matchService && matchPayment
      })
      .sort((a, b) => {
        if (sortBy === 'amount_desc') return (b.total_amount || 0) - (a.total_amount || 0)
        if (sortBy === 'date_asc') return new Date(a.installation_date).getTime() - new Date(b.installation_date).getTime()
        // default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [orders, searchQuery, statusFilter, serviceFilter, paymentFilter, sortBy])

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

  // Financial & Operational KPI summary
  const orderStats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled')
    const totalAmount = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const totalDeposited = validOrders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0)
    const remainingReceivables = Math.max(0, totalAmount - totalDeposited)

    const inProgressCount = orders.filter((o) => o.status === 'in_progress').length
    const surveyCount = orders.filter((o) => o.status === 'survey' || o.status === 'pending').length
    const warrantyCount = orders.filter((o) => o.status === 'warranty').length

    return {
      totalOrders: orders.length,
      totalAmount,
      totalDeposited,
      remainingReceivables,
      inProgressCount,
      surveyCount,
      warrantyCount,
    }
  }, [orders])

  const handleSyncFromPosts = async () => {
    if (!confirm('Hệ thống sẽ tự động quét toàn bộ bài viết công trình trong cơ sở dữ liệu để tạo khách hàng và đơn hàng tương ứng. Bạn có muốn tiếp tục?')) return
    setIsSyncing(true)
    try {
      const res = await fetch('/api/admin/sync-posts', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'Đồng bộ thành công!')
        if (onRefreshData) onRefreshData()
        else window.location.reload()
      } else {
        alert(data.error || 'Lỗi đồng bộ')
      }
    } catch (e: any) {
      alert('Lỗi kết nối máy chủ: ' + e.message)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Apple Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] tracking-wide uppercase">
            <ClipboardList className="w-4 h-4" />
            <span>Quản Lý Tiến Độ Thi Công & Hợp Đồng</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight mt-1">
            Đơn Hàng & Hợp Đồng Thi Công
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1">
            Theo dõi chi tiết đơn thi công camera, khóa vân tay, mạng wifi, vật tư nghiệm thu và cam kết bảo hành.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleSyncFromPosts}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#0071E3] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-blue-200/80 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50"
            title="Tự động đồng bộ và trích xuất đơn hàng từ tất cả các bài viết công trình"
          >
            <RefreshCw className={cn("w-4 h-4 text-[#0071E3]", isSyncing && "animate-spin")} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Từ Bài Viết'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
            title="Tải về danh sách đơn hàng định dạng CSV"
          >
            <Download className="w-4 h-4 text-[#86868B]" />
            <span>Xuất Báo Cáo (.CSV)</span>
          </button>
          <button
            onClick={() => openCreateModal(initialNewOrderCustomer)}
            className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Thi Công Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Financial & Operational KPI Cards (Apple Squircle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-200/60 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Tổng Doanh Số Đơn Hàng
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#1D1D1F] font-mono tabular-nums">
              {formatVND(orderStats.totalAmount)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Đang Thi Công & Khảo Sát
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
                {orderStats.inProgressCount + orderStats.surveyCount}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Đã Thu / Tạm Ứng
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {formatVND(orderStats.totalDeposited)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
            <BadgeAlert className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Công Nợ Còn Lại
            </span>
            <span className="text-xl sm:text-2xl font-bold text-rose-600 font-mono tabular-nums">
              {formatVND(orderStats.remainingReceivables)}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-layer Search & Status Segmented Toolbar */}
      <div className="space-y-3">
        {/* Apple Segmented Status Tabs */}
        <div className="bg-white p-2.5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'Tất cả đơn', count: orders.length },
            { id: 'in_progress', label: 'Đang thi công', count: orders.filter((o) => o.status === 'in_progress').length, color: 'text-[#0071E3]' },
            { id: 'pending', label: 'Chờ thi công', count: orders.filter((o) => o.status === 'pending').length },
            { id: 'survey', label: 'Khảo sát / Báo giá', count: orders.filter((o) => o.status === 'survey').length },
            { id: 'warranty', label: 'Đang bảo hành', count: orders.filter((o) => o.status === 'warranty').length, color: 'text-purple-700' },
            { id: 'completed', label: 'Đã hoàn thành', count: orders.filter((o) => o.status === 'completed').length, color: 'text-emerald-700' },
          ].map((tab) => {
            const active = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id)
                  setCurrentPage(1)
                }}
                className={cn(
                  'px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0',
                  active
                    ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_8px_rgba(0,113,227,0.25)]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-100/80'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[10.5px] px-2 py-0.2 rounded-full font-mono tabular-nums font-bold',
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#86868B]'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search, Services & Payment Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo mã đơn (C247-...), tên khách, SĐT, thiết bị, KTV..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0"
            >
              <option value="all">Tất cả gói dịch vụ</option>
              {CAMERA247_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán 100%</option>
              <option value="unpaid">Còn công nợ chưa thu</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any)
                setCurrentPage(1)
              }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0"
            >
              <option value="newest">Mới tạo gần đây</option>
              <option value="amount_desc">Trị giá cao nhất</option>
              <option value="date_asc">Lịch thi công gần nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12 whitespace-nowrap">STT</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Mã Đơn & KTV</th>
                <th className="py-3.5 px-4 min-w-[200px]">Khách Hàng & Địa Chỉ</th>
                <th className="py-3.5 px-4 min-w-[220px]">Gói Dịch Vụ & Thiết Bị</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Lịch Thi Công</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Bảo Hành</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Trị Giá / Công Nợ</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#1D1D1F]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center space-y-2">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-[#1D1D1F]">Không tìm thấy đơn hàng phù hợp</p>
                    <p className="text-xs text-[#86868B]">Thử đổi điều kiện tìm kiếm hoặc bấm Tạo đơn thi công mới.</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord, idx) => {
                  const remainingAmount = Math.max(0, (ord.total_amount || 0) - (ord.deposit_amount || 0))
                  const warrantyInfo = isWarrantyActive(ord.warranty_until)
                  const st = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setViewingOrder(ord)}
                    >
                      {/* Index / STT */}
                      <td className="py-4 px-4 text-center font-mono text-[#86868B] text-[11px]">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>

                      {/* Order Code & Technician */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#0071E3] text-xs block">
                          #{ord.order_code}
                        </span>
                        <span className="text-[11px] text-[#86868B]">
                          KTV: <strong className="text-[#1D1D1F]">{ord.technician || 'Lập & Tước'}</strong>
                        </span>
                      </td>

                      {/* Customer & Direct Action Hub */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 text-sm">
                            {ord.customer_name}
                          </p>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`tel:${ord.customer_phone.replace(/\s+/g, '')}`}
                              className="font-mono font-medium text-[#1D1D1F] hover:text-[#0071E3] inline-flex items-center gap-1 transition-colors text-xs"
                              title="Gọi điện cho khách hàng"
                            >
                              <Phone className="w-3 h-3 text-[#0071E3]" />
                              {ord.customer_phone}
                            </a>

                            <a
                              href={`https://zalo.me/${ord.customer_phone.replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-[#0071E3] border border-blue-200 hover:bg-[#0071E3] hover:text-white transition-all shadow-2xs"
                              title="Chat Zalo với khách"
                            >
                              Zalo
                            </a>
                          </div>
                          <p className="text-[11.5px] text-[#86868B] line-clamp-1 mt-0.5">
                            📍 {ord.customer_address}
                          </p>
                        </div>
                      </td>

                      {/* Services & Equipment */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(ord.services || []).map((sId) => {
                            const sDef = CAMERA247_SERVICES.find((s) => s.id === sId)
                            if (!sDef) return null
                            return (
                              <span
                                key={sId}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border bg-slate-100 text-[#1D1D1F] border-slate-200/80"
                              >
                                {sDef.name.split('/')[0].trim()}
                              </span>
                            )
                          })}
                        </div>
                        <p className="text-xs text-[#424245] line-clamp-2 leading-relaxed">
                          {ord.equipment_list}
                        </p>
                      </td>

                      {/* Installation Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[#1D1D1F] font-semibold block font-mono">
                          {ord.installation_date || '—'}
                        </span>
                        {ord.completion_date && (
                          <span className="text-[10.5px] text-emerald-700 block font-medium">
                            Bàn giao: {ord.completion_date}
                          </span>
                        )}
                      </td>

                      {/* Warranty */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-[#1D1D1F] font-bold font-mono">
                          {ord.warranty_months} tháng
                        </div>
                        {ord.warranty_until && (
                          <div
                            className={cn(
                              'text-[10.5px] font-mono mt-0.5',
                              warrantyInfo.active ? 'text-indigo-700 font-semibold' : 'text-slate-400 line-through'
                            )}
                          >
                            Đến: {ord.warranty_until}
                          </div>
                        )}
                      </td>

                      {/* Total & Remaining */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-[#1D1D1F] text-sm block font-mono tabular-nums">
                          {formatVND(ord.total_amount)}
                        </span>
                        {ord.total_amount > 0 ? (
                          remainingAmount > 0 ? (
                            <span className="text-[10.5px] text-rose-600 font-mono font-semibold block">
                              Nợ: {formatVND(remainingAmount)}
                            </span>
                          ) : (
                            <span className="text-[10.5px] text-emerald-700 font-semibold block">
                              Đã thu đủ ✓
                            </span>
                          )
                        ) : (
                          <span className="text-[10.5px] text-[#86868B] font-medium block">
                            Báo giá theo HĐ
                          </span>
                        )}
                      </td>

                      {/* Status & Quick Status Changer */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={ord.status}
                            onChange={(e) => handleQuickStatusChange(ord, e.target.value as any)}
                            className={cn(
                              'text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none pr-6 transition-all',
                              ord.status === 'in_progress' && 'bg-blue-50 text-[#0071E3] border-blue-200',
                              ord.status === 'completed' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              ord.status === 'warranty' && 'bg-purple-50 text-purple-700 border-purple-200',
                              ord.status === 'survey' && 'bg-amber-50 text-amber-800 border-amber-200',
                              ord.status === 'pending' && 'bg-sky-50 text-sky-700 border-sky-200',
                              ord.status === 'cancelled' && 'bg-rose-50 text-rose-700 border-rose-200'
                            )}
                          >
                            <option value="survey">Khảo sát / Báo giá</option>
                            <option value="pending">Chờ thi công</option>
                            <option value="in_progress">Đang thi công</option>
                            <option value="completed">Đã bàn giao</option>
                            <option value="warranty">Đang bảo hành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] opacity-60">
                            ▼
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-[#0071E3] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                            title="Xem chi tiết & In phiếu A4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(ord)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all"
                            title="Chỉnh sửa đơn hàng"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(ord)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                            title="Xóa đơn hàng"
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

        {/* Pagination Bar with Page Numbers */}
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          itemsPerPage={ITEMS_PER_PAGE}
          itemLabel="đơn hàng"
          onPageChange={(page) => setCurrentPage(page)}
          className="rounded-t-none border-x-0 border-b-0 border-t bg-slate-50/50"
        />

      </div>

      {/* Add / Edit Order Sheet Modal (iOS Sheet Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-3xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                    {editingOrder
                      ? `Chỉnh Sửa Đơn Hàng: #${editingOrder.order_code}`
                      : 'Tạo Đơn Hàng Thi Công & Cam Kết Bảo Hành Mới'}
                  </h3>
                  <p className="text-[11px] text-[#86868B]">
                    Hệ thống tự động tính toán hạn bảo hành và cập nhật vào hồ sơ khách hàng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              {/* 1. Services Selection */}
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
                        className={cn(
                          'p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5',
                          isSelected
                            ? 'bg-blue-50/80 border-[#0071E3] text-[#0071E3] shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-[#1D1D1F] hover:bg-slate-100'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors',
                            isSelected ? 'bg-[#0071E3] border-[#0071E3] text-white' : 'border-slate-300 bg-white'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold leading-snug truncate">{serv.name}</p>
                          <p className="text-[10.5px] text-[#86868B] mt-0.5">{serv.category}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Customer Information & Autocomplete */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
                  2. Khách Hàng & Địa Điểm Thi Công *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                      Tên khách hàng / Đơn vị *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => {
                        setFormData({ ...formData, customer_name: e.target.value })
                        setCustomerSearch(e.target.value)
                      }}
                      placeholder="Gõ để tìm trong danh bạ..."
                      className="w-full bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />

                    {/* Autocomplete dropdown */}
                    {matchedCustomers.length > 0 && customerSearch !== formData.customer_name && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                        {matchedCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCustomer(c)}
                            className="p-3 hover:bg-blue-50/70 cursor-pointer text-xs transition-colors"
                          >
                            <p className="font-semibold text-[#1D1D1F]">{c.name}</p>
                            <p className="text-[11px] text-[#86868B]">📞 {c.phone} · 📍 {c.address}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                      Số điện thoại liên hệ *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="0914 xxx xxx"
                      className="w-full bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                    Địa chỉ công trình tại Huế *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    placeholder="Số nhà, Đường, Phường/Xã, TP. Huế"
                    className="w-full bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* 3. Equipment & Specs */}
              <div>
                <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1">
                  3. Danh Mục Thiết Bị & Cấu Hình Lắp Đặt *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.equipment_list}
                  onChange={(e) => setFormData({ ...formData, equipment_list: e.target.value })}
                  placeholder="VD: 04 Camera Dahua IP 4MP Full Color + Đầu ghi NVR 4 kênh + Ổ cứng 1TB Seagate + 01 Switch PoE..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>

              {/* 4. Dates & Warranty Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Ngày thi công *</label>
                  <input
                    type="text"
                    required
                    value={formData.installation_date}
                    onChange={(e) => handleInstallationDateChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] font-mono focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Thời hạn bảo hành</label>
                  <select
                    value={formData.warranty_months}
                    onChange={(e) => handleWarrantyChange(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  >
                    <option value={12}>12 Tháng (1 Năm)</option>
                    <option value={24}>24 Tháng (2 Năm - Chuẩn C247)</option>
                    <option value={36}>36 Tháng (3 Năm)</option>
                    <option value={48}>48 Tháng (4 Năm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Hạn bảo hành đến</label>
                  <input
                    type="text"
                    value={formData.warranty_until}
                    onChange={(e) => setFormData({ ...formData, warranty_until: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#0071E3] font-mono font-bold focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* 5. Pricing, Deposit & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                    Tổng trị giá hợp đồng (VNĐ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.total_amount_str}
                    onChange={(e) => setFormData({ ...formData, total_amount_str: e.target.value })}
                    placeholder="8.500.000"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] font-bold font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                    Đã thanh toán / Đặt cọc (VNĐ)
                  </label>
                  <input
                    type="text"
                    value={formData.deposit_amount_str}
                    onChange={(e) => setFormData({ ...formData, deposit_amount_str: e.target.value })}
                    placeholder="3.000.000"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                    Trạng thái thi công
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
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
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                    Kỹ thuật viên phụ trách
                  </label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    placeholder="Lập & Tước / Đội KTV"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                    Ghi chú thi công / Bàn giao
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Vị trí lắp đặt, nguồn điện, lưu ý khách..."
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-2.5 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
                >
                  {editingOrder ? 'Lưu Thay Đổi Đơn Hàng' : 'Tạo Đơn Hàng Thi Công'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs sm:text-sm border border-slate-200 font-medium transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail & Printable A4 Handover Slip Modal (iOS Sheet Style) */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Actions Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                    Phiếu Nghiệm Thu & Bảo Hành: #{viewingOrder.order_code}
                  </h3>
                  <p className="text-[11px] text-[#86868B]">Camera 247 Huế · Bản in tiêu chuẩn A4</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
                  title="In trực tiếp hoặc Lưu dưới dạng PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu A4</span>
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable A4 Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 bg-white text-slate-900 print:m-0 print:p-0">
              {/* Brand Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-950 font-black text-xs">
                      247
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                      CÔNG TY TNHH CÔNG NGHỆ AN NINH HUẾ
                    </h2>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">
                    Thương hiệu: Camera 247 Huế · Mã số thuế: 3301677400
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Hotline kỹ thuật: 0796 785 151 (Tước) · 0967 611 112 (Lập)
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Website: camera247hue.com · Địa bàn: Thừa Thiên Huế
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-[#0071E3] text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                    {viewingOrder.order_code}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Ngày: {viewingOrder.installation_date}
                  </p>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center py-1">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-950">
                  PHIẾU BÀN GIAO THI CÔNG & CAM KẾT BẢO HÀNH
                </h3>
                <p className="text-[11px] text-slate-500 italic">
                  (Kiêm biên bản nghiệm thu kỹ thuật và xác nhận thanh toán)
                </p>
              </div>

              {/* Customer Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>
                    <strong className="text-slate-700">Khách hàng:</strong>{' '}
                    <span className="font-semibold text-slate-950">{viewingOrder.customer_name}</span>
                  </p>
                  <p>
                    <strong className="text-slate-700">Số điện thoại:</strong>{' '}
                    <span className="font-mono font-semibold text-slate-950">{viewingOrder.customer_phone}</span>
                  </p>
                </div>
                <p>
                  <strong className="text-slate-700">Địa chỉ thi công:</strong>{' '}
                  <span className="text-slate-950">{viewingOrder.customer_address}</span>
                </p>
                <p>
                  <strong className="text-slate-700">Kỹ thuật viên phụ trách:</strong>{' '}
                  <span className="text-slate-950 font-semibold">{viewingOrder.technician || 'Camera 247 Huế'}</span>
                </p>
              </div>

              {/* Equipment list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Danh mục thiết bị & giải pháp kỹ thuật đã lắp đặt:
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {viewingOrder.equipment_list}
                </div>
              </div>

              {/* Pricing & Warranty Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900 uppercase">Chính Sách Bảo Hành Chính Hãng</p>
                  <p>• Thời hạn cam kết: <strong className="text-[#0071E3]">{viewingOrder.warranty_months} tháng</strong></p>
                  <p>• Hiệu lực đến ngày: <strong className="text-indigo-700 font-mono">{viewingOrder.warranty_until}</strong></p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">• Hỗ trợ xử lý sự cố kỹ thuật tận nơi 24/7 trên toàn tỉnh Thừa Thiên Huế.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-right">
                  <p className="font-bold text-slate-900 uppercase text-left">Chi Tiết Thanh Toán</p>
                  <p>
                    Tổng trị giá hợp đồng:{' '}
                    <strong className="font-mono text-sm text-slate-950">
                      {formatVND(viewingOrder.total_amount)}
                    </strong>
                  </p>
                  <p>
                    Đã thanh toán / Tạm ứng:{' '}
                    <span className="font-mono font-semibold text-emerald-700">
                      {formatVND(viewingOrder.deposit_amount)}
                    </span>
                  </p>
                  <p>
                    Số tiền còn lại:{' '}
                    <strong className="font-mono text-rose-600">
                      {formatVND(Math.max(0, viewingOrder.total_amount - viewingOrder.deposit_amount))}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-6 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-900 uppercase">Đại Diện Khách Hàng</p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký & ghi rõ họ tên)</p>
                  <div className="h-16" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 uppercase">Đại Diện Camera 247 Huế</p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">(Kỹ thuật viên nghiệm thu)</p>
                  <div className="h-16 flex items-center justify-center font-bold text-[#0071E3]">
                    Camera 247 Huế
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between">
              <button
                onClick={() => {
                  const ord = viewingOrder
                  setViewingOrder(null)
                  openEditModal(ord)
                }}
                className="px-4 py-2 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs font-semibold border border-slate-200 transition-all inline-flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh Sửa Đơn Hàng
              </button>

              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 bg-[#1D1D1F] text-white hover:bg-slate-800 rounded-2xl text-xs font-semibold shadow-xs transition-all"
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
          <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl p-6 text-center space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">Xác Nhận Xóa Đơn Hàng</h3>
              <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
                Bạn có chắc muốn xóa đơn hàng <strong className="text-[#0071E3] font-mono">#{orderToDelete.order_code}</strong> của khách <strong className="text-[#1D1D1F]">{orderToDelete.customer_name}</strong> không?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  onDeleteOrder(orderToDelete.id)
                  setOrderToDelete(null)
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-2xl text-xs shadow-xs transition-colors"
              >
                Xác Nhận Xóa
              </button>
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs font-medium border border-slate-200 transition-all"
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
