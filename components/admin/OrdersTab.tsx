'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
  MessageCircle,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Filter,
  Wrench,
  Receipt,
  BadgeAlert,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  RotateCcw
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

const EQUIPMENT_PRESETS = [
  {
    label: 'Bộ 4 Camera Full Color 4MP Dahua AI',
    text: 'Trọn gói 04 Camera Full Color 4MP Dahua AI + Đầu ghi NVR 4 kênh 4K + Ổ cứng 1TB Seagate + Switch PoE và phụ kiện thi công',
    price: '8.500.000',
    deposit: '3.000.000',
    warranty: 24,
  },
  {
    label: 'Bộ 8 Camera Hikvision 4MP ColorVu 24/7',
    text: 'Trọn gói 08 Camera Hikvision 4MP ColorVu có màu ban đêm + Đầu ghi NVR 8 kênh + Ổ cứng 2TB Skyhawk + Tủ rack trung tâm & switch PoE',
    price: '16.800.000',
    deposit: '6.000.000',
    warranty: 24,
  },
  {
    label: 'Khóa Cửa Vân Tay FaceID Thông Minh',
    text: 'Khóa cửa thông minh FaceID 3D AI + Vân tay FPC Thụy Điển + Thẻ từ NFC + Chìa cơ chống sao chép + Lắp đặt trọn gói',
    price: '5.900.000',
    deposit: '2.000.000',
    warranty: 24,
  },
  {
    label: 'Hạ Tầng Mạng Wifi 6 Mesh Chuyên Dụng',
    text: 'Hệ thống 03 Node Wifi 6 Mesh Gigabits chịu tải 150 thiết bị + Router cân bằng tải Mikrotik + Dây mạng Cat6 UTP Commscope',
    price: '7.200.000',
    deposit: '3.000.000',
    warranty: 24,
  },
]

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
      services: order.services && order.services.length > 0 ? order.services : ['camera'],
      equipment_list: order.equipment_list || '',
      installation_date: order.installation_date || '',
      completion_date: order.completion_date || '',
      warranty_months: order.warranty_months || 24,
      warranty_until: order.warranty_until || '',
      total_amount_str: formatNumber(order.total_amount || 0),
      deposit_amount_str: formatNumber(order.deposit_amount || 0),
      status: order.status || 'in_progress',
      technician: order.technician || 'Lập & Tước',
      notes: order.notes || '',
    })
    setCustomerSearch(order.customer_name || '')
    setFormError('')
    setIsModalOpen(true)
  }

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

  const handleApplyEquipmentPreset = (preset: typeof EQUIPMENT_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      equipment_list: preset.text,
      total_amount_str: preset.price,
      deposit_amount_str: preset.deposit,
      warranty_months: preset.warranty,
      warranty_until: calculateWarrantyEnd(prev.installation_date, preset.warranty),
    }))
  }

  const handleWarrantyMonthsChange = (months: number) => {
    const until = calculateWarrantyEnd(formData.installation_date, months)
    setFormData((prev) => ({
      ...prev,
      warranty_months: months,
      warranty_until: until,
    }))
  }

  const handleSelectCustomer = (c: Customer) => {
    setFormData((prev) => ({
      ...prev,
      customer_id: c.id,
      customer_name: c.name,
      customer_phone: c.phone || '',
      customer_address: c.address || '',
    }))
    setCustomerSearch(c.name)
  }

  const matchedCustomers = useMemo(() => {
    if (!customerSearch.trim()) return []
    const q = customerSearch.toLowerCase().trim()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    ).slice(0, 5)
  }, [customers, customerSearch])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customer_name.trim()) {
      setFormError('Vui lòng nhập tên khách hàng.')
      return
    }

    const totalAmount = parseVND(formData.total_amount_str)
    const depositAmount = parseVND(formData.deposit_amount_str)

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
      warranty_months: Number(formData.warranty_months) || 24,
      warranty_until: formData.warranty_until.trim(),
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      status: formData.status,
      technician: formData.technician.trim(),
      notes: formData.notes.trim(),
    })

    setIsModalOpen(false)
  }

  // Filter & sort orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return orders
      .filter((o) => {
        const matchSearch =
          !q ||
          o.order_code?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          (o.customer_phone && o.customer_phone.includes(q)) ||
          (o.customer_address && o.customer_address.toLowerCase().includes(q)) ||
          (o.equipment_list && o.equipment_list.toLowerCase().includes(q)) ||
          (o.technician && o.technician.toLowerCase().includes(q))

        let matchStatus = true
        if (statusFilter === 'warranty') {
          matchStatus = isWarrantyActive(o.warranty_until).active
        } else if (statusFilter !== 'all') {
          matchStatus = o.status === statusFilter
        }

        let matchService = true
        if (serviceFilter !== 'all') {
          matchService = Array.isArray(o.services) && o.services.includes(serviceFilter)
        }

        let matchPayment = true
        if (paymentFilter === 'paid') {
          matchPayment = (o.deposit_amount || 0) >= (o.total_amount || 0) && (o.total_amount || 0) > 0
        } else if (paymentFilter === 'unpaid') {
          matchPayment = (o.deposit_amount || 0) < (o.total_amount || 0)
        }

        return matchSearch && matchStatus && matchService && matchPayment
      })
      .sort((a, b) => {
        if (sortBy === 'amount_desc') {
          return (b.total_amount || 0) - (a.total_amount || 0)
        }
        if (sortBy === 'date_asc') {
          return (a.installation_date || '').localeCompare(b.installation_date || '')
        }
        // Default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [orders, searchQuery, statusFilter, serviceFilter, paymentFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

  // Key KPI stats
  const orderStats = useMemo(() => {
    const total = orders.length
    const inProgressCount = orders.filter((o) => o.status === 'in_progress').length
    const surveyCount = orders.filter((o) => o.status === 'survey').length
    const completedCount = orders.filter((o) => o.status === 'completed').length

    let totalRevenue = 0
    let totalDeposited = 0
    orders.forEach((o) => {
      if (o.status !== 'cancelled') {
        totalRevenue += o.total_amount || 0
        totalDeposited += o.deposit_amount || 0
      }
    })

    const remainingDebt = Math.max(0, totalRevenue - totalDeposited)
    const warrantyCount = orders.filter((o) => isWarrantyActive(o.warranty_until).active).length

    return {
      total,
      inProgressCount,
      surveyCount,
      completedCount,
      totalRevenue,
      totalDeposited,
      remainingDebt,
      warrantyCount,
    }
  }, [orders])

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner - Apple Light Style */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                Quản Lý Đơn Hàng & Thi Công
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0071E3] border border-blue-200/60">
                {orders.length} đơn hàng
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
              Theo dõi tiến độ lắp đặt thực tế, nghiệm thu thanh toán & cam kết bảo hành tại Huế
            </p>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
              title="Làm mới dữ liệu đơn hàng"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>
          )}

          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Hàng Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Financial & Operational Metric Cards - 2x2 Mobile, 4-col Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {orderStats.total}
            </span>
            <span className="text-xs text-slate-500">hợp đồng</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang Thi Công</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">
              {orderStats.inProgressCount}
            </span>
            <span className="text-xs text-slate-500">công trình</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh Thu Thực Thu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-bold text-emerald-700 font-mono tabular-nums truncate block">
              {formatVND(orderStats.totalDeposited)}
            </span>
            <span className="text-[11px] text-slate-500">Đã thanh toán / cọc</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công Nợ Còn Lại</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-bold text-rose-600 font-mono tabular-nums truncate block">
              {formatVND(orderStats.remainingDebt)}
            </span>
            <span className="text-[11px] text-slate-500">Thu khi bàn giao</span>
          </div>
        </div>
      </div>

      {/* Multi-layer Search & Status Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        {/* Row 1: Segmented Status Pills & Active Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar gap-1 max-w-full">
            {[
              { id: 'all', label: 'Tất cả đơn', count: orders.length },
              { id: 'in_progress', label: 'Đang thi công', count: orderStats.inProgressCount },
              { id: 'pending', label: 'Chờ thi công', count: orders.filter((o) => o.status === 'pending').length },
              { id: 'survey', label: 'Khảo sát / Báo giá', count: orderStats.surveyCount },
              { id: 'warranty', label: 'Đang bảo hành', count: orderStats.warrantyCount },
              { id: 'completed', label: 'Đã hoàn thành', count: orderStats.completedCount },
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
                    'px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0',
                    active
                      ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums font-bold',
                      active ? 'bg-blue-50 text-[#0071E3]' : 'bg-slate-200/60 text-[#86868B]'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {(searchQuery || statusFilter !== 'all' || serviceFilter !== 'all' || paymentFilter !== 'all' || sortBy !== 'newest') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setServiceFilter('all')
                setPaymentFilter('all')
                setSortBy('newest')
                setCurrentPage(1)
              }}
              className="inline-flex items-center gap-1 text-xs text-[#0071E3] hover:underline self-end sm:self-auto font-medium px-2 py-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {/* Row 2: Search Input + Service Filter + Payment Filter + Sort By */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Bar */}
          <div className="relative sm:col-span-12 lg:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo mã đơn (C247-...), tên khách, SĐT, thiết bị, KTV..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9.5 pr-8 py-2.5 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Service Filter */}
          <div className="relative sm:col-span-4 lg:col-span-3">
            <Wrench className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-7 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer truncate font-medium"
            >
              <option value="all">Tất cả gói dịch vụ</option>
              {CAMERA247_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Payment Filter */}
          <div className="relative sm:col-span-4 lg:col-span-2">
            <Receipt className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-7 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer truncate font-medium"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán 100%</option>
              <option value="unpaid">Còn công nợ</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative sm:col-span-4 lg:col-span-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-7 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer truncate font-medium"
            >
              <option value="newest">Mới tạo gần đây</option>
              <option value="amount_desc">Trị giá cao nhất</option>
              <option value="date_asc">Lịch thi công gần nhất</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders List: Responsive Desktop Table + Mobile Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4 min-w-[210px]">Mã Đơn & Khách Hàng</th>
                <th className="py-3.5 px-4 min-w-[240px]">Dịch Vụ & Thiết Bị Thi Công</th>
                <th className="py-3.5 px-4 min-w-[170px]">Tiến Độ & Bảo Hành</th>
                <th className="py-3.5 px-4 text-right min-w-[150px]">Trị Giá & Thanh Toán</th>
                <th className="py-3.5 px-4 text-center min-w-[140px]">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#1D1D1F]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center space-y-2">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-[#1D1D1F]">Không tìm thấy đơn hàng phù hợp</p>
                    <p className="text-xs text-[#86868B]">Thử thay đổi bộ lọc hoặc bấm Tạo đơn hàng mới.</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord, idx) => {
                  const st = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending
                  const remaining = Math.max(0, (ord.total_amount || 0) - (ord.deposit_amount || 0))
                  const isWarrantyNow = isWarrantyActive(ord.warranty_until)

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setViewingOrder(ord)}
                    >
                      {/* Index */}
                      <td className="py-4 px-4 text-center font-mono text-[#86868B] text-[11px]">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>

                      {/* Code & Customer */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60">
                              #{ord.order_code}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                            {ord.customer_name}
                          </p>
                          {ord.customer_phone && (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={`tel:${ord.customer_phone.replace(/\s+/g, '')}`}
                                className="text-[11px] font-mono text-slate-600 hover:text-[#0071E3] flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-[#0071E3]" />
                                {ord.customer_phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Services & Equipment */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap gap-1">
                            {(ord.services || []).map((sId) => {
                              const sDef = CAMERA247_SERVICES.find((s) => s.id === sId)
                              if (!sDef) return null
                              return (
                                <span
                                  key={sId}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                                >
                                  {sDef.name.split('/')[0].trim()}
                                </span>
                              )
                            })}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 max-w-sm leading-relaxed" title={ord.equipment_list}>
                            {ord.equipment_list}
                          </p>
                        </div>
                      </td>

                      {/* Progress & Warranty */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Lắp: <strong>{ord.installation_date || '—'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShieldCheck className={cn('w-3 h-3', isWarrantyNow.active ? 'text-indigo-600' : 'text-slate-400')} />
                            <span className={isWarrantyNow.active ? 'text-indigo-700 font-semibold font-mono' : 'text-slate-400'}>
                              BH: {ord.warranty_months}T ({ord.warranty_until || '—'})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-4 px-4 text-right">
                        <div className="space-y-0.5 font-mono">
                          <span className="font-bold text-sm text-slate-900 block">
                            {formatVND(ord.total_amount)}
                          </span>
                          <div className="text-[11px]">
                            {remaining === 0 && (ord.total_amount || 0) > 0 ? (
                              <span className="text-emerald-700 font-medium">Đã thanh toán đủ</span>
                            ) : (
                              <span className="text-rose-600 font-medium">
                                Nợ: {formatVND(remaining)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={cn('inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border', st.badgeClass)}>
                          {st.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-[#0071E3] hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết & In phiếu A4"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(ord)}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Chỉnh sửa đơn"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(ord)}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa đơn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedOrders.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#1D1D1F]">Không tìm thấy đơn hàng</p>
              <p className="text-xs text-[#86868B]">Thử tìm kiếm hoặc tạo đơn hàng mới.</p>
            </div>
          ) : (
            paginatedOrders.map((ord) => {
              const st = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending
              const remaining = Math.max(0, (ord.total_amount || 0) - (ord.deposit_amount || 0))
              const isWarrantyNow = isWarrantyActive(ord.warranty_until)

              return (
                <div
                  key={ord.id}
                  className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors"
                  onClick={() => setViewingOrder(ord)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          #{ord.order_code}
                        </span>
                        <span className={cn('text-[10.5px] font-semibold px-2 py-0.2 rounded-full border', st.badgeClass)}>
                          {st.label}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {ord.customer_name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {formatVND(ord.total_amount)}
                      </span>
                      <span className={cn('text-[10px] font-medium font-mono', remaining === 0 ? 'text-emerald-700' : 'text-rose-600')}>
                        {remaining === 0 ? 'Đã thanh toán đủ' : `Còn nợ: ${formatVND(remaining)}`}
                      </span>
                    </div>
                  </div>

                  {/* Phone & Zalo */}
                  {ord.customer_phone && (
                    <div className="flex items-center gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${ord.customer_phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-[#0071E3] border border-blue-200 font-semibold"
                      >
                        <PhoneCall className="w-3 h-3" />
                        {ord.customer_phone}
                      </a>
                      <a
                        href={`https://zalo.me/${ord.customer_phone.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Zalo
                      </a>
                    </div>
                  )}

                  {/* Equipment snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ord.equipment_list}
                  </p>

                  {/* Card bottom footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500" onClick={(e) => e.stopPropagation()}>
                    <span>
                      Lắp: <strong>{ord.installation_date}</strong> · BH: <strong>{ord.warranty_months}T</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(ord)}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(ord)}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-amber-700"
                        title="Sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderToDelete(ord)}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination Bar */}
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

      {/* CREATE / EDIT ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                  <ClipboardList className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingOrder ? `Chỉnh Sửa Đơn Hàng: #${editingOrder.order_code}` : 'Tạo Đơn Hàng Thi Công & Cam Kết Bảo Hành Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">Tự động tính toán hạn bảo hành và cập nhật hồ sơ</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* 1. Services Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
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
                            : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100'
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
                          <p className="text-[10.5px] text-slate-500 mt-0.5">{serv.category}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Customer Information & Autocomplete */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Khách Hàng & Địa Điểm Thi Công *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
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
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                    />

                    {/* Autocomplete dropdown */}
                    {matchedCustomers.length > 0 && customerSearch !== formData.customer_name && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                        {matchedCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCustomer(c)}
                            className="p-3 hover:bg-blue-50/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{c.name}</span>
                              <span className="text-slate-500 text-[11px] ml-2">📍 {c.district}</span>
                            </div>
                            <span className="font-mono text-[#0071E3] font-semibold">{c.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Số điện thoại liên hệ *
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="0982 929 088"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Địa chỉ thi công lắp đặt tại Huế
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    placeholder="40 Tùng Thiện Vương, Vỹ Dạ, TP. Huế"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* 3. Equipment Presets & Custom List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Danh Mục Thiết Bị & Vật Tư Thi Công *
                  </label>
                  <span className="text-[11px] text-slate-500">Bấm mẫu để điền nhanh:</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {EQUIPMENT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyEquipmentPreset(p)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0071E3] border border-slate-200 text-[11px] font-medium transition-colors"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  required
                  value={formData.equipment_list}
                  onChange={(e) => setFormData({ ...formData, equipment_list: e.target.value })}
                  placeholder="Ghi rõ số lượng camera, đầu ghi, ổ cứng, phụ kiện..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 leading-relaxed transition-all"
                />
              </div>

              {/* 4. Timeline & Warranty Calculator */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4. Tiến Độ Thi Công & Thời Hạn Bảo Hành
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Ngày thi công (dd/mm/yyyy)
                    </label>
                    <input
                      type="text"
                      value={formData.installation_date}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData({
                          ...formData,
                          installation_date: val,
                          warranty_until: calculateWarrantyEnd(val, formData.warranty_months),
                        })
                      }}
                      placeholder="01/03/2026"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0071E3] font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Thời hạn bảo hành
                    </label>
                    <select
                      value={formData.warranty_months}
                      onChange={(e) => handleWarrantyMonthsChange(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0071E3] transition-all font-semibold"
                    >
                      <option value={12}>12 Tháng (1 Năm)</option>
                      <option value={24}>24 Tháng (2 Năm - Chuẩn)</option>
                      <option value={36}>36 Tháng (3 Năm - Cao cấp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Hiệu lực bảo hành đến
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.warranty_until}
                      className="w-full bg-indigo-50/60 border border-indigo-200 text-indigo-700 font-mono font-bold rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Financials & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Tổng giá trị hợp đồng (VNĐ)
                  </label>
                  <input
                    type="text"
                    value={formData.total_amount_str}
                    onChange={(e) => setFormData({ ...formData, total_amount_str: e.target.value })}
                    placeholder="8.500.000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] font-mono font-bold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Đã thanh toán / Tạm ứng (VNĐ)
                  </label>
                  <input
                    type="text"
                    value={formData.deposit_amount_str}
                    onChange={(e) => setFormData({ ...formData, deposit_amount_str: e.target.value })}
                    placeholder="3.000.000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-emerald-700 focus:bg-white focus:outline-none focus:border-[#0071E3] font-mono font-bold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Trạng thái đơn hàng
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] font-semibold transition-all"
                  >
                    <option value="pending">Chờ thi công</option>
                    <option value="survey">Khảo sát / Báo giá</option>
                    <option value="in_progress">Đang thi công</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* Technician & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Kỹ thuật viên phụ trách
                  </label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    placeholder="Lập & Tước / Đội KTV"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Ghi chú thi công / Bàn giao
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Vị trí lắp đặt, nguồn điện, lưu ý khách..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs rounded-2xl shadow-xs transition-all active:scale-[0.98]"
                >
                  {editingOrder ? 'Lưu Thay Đổi Đơn Hàng' : 'Tạo Đơn Hàng Thi Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER & PRINTABLE A4 SLIP MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Actions Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Phiếu Nghiệm Thu & Bảo Hành: #{viewingOrder.order_code}
                  </h3>
                  <p className="text-xs text-slate-500">Camera 247 Huế · Bản in tiêu chuẩn A4</p>
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
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 bg-white text-slate-900 print:m-0 print:p-0 flex-1">
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
                    Thương hiệu: Camera 247 Huế · Showroom: 40 Tùng Thiện Vương, Vỹ Dạ, TP. Huế
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Hotline kỹ thuật: 0982 929 088 · 0984 929 088
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
                  <p className="text-[11px] text-slate-500 leading-relaxed">• Hỗ trợ xử lý sự cố kỹ thuật tận nơi 24/7 tại TP. Huế.</p>
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
                      {formatVND(Math.max(0, (viewingOrder.total_amount || 0) - (viewingOrder.deposit_amount || 0)))}
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
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex items-center justify-between">
              <button
                onClick={() => {
                  const ord = viewingOrder
                  setViewingOrder(null)
                  openEditModal(ord)
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl text-xs font-semibold border border-slate-200 transition-all inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh Sửa Đơn Này
              </button>

              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-semibold shadow-xs transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa đơn hàng?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn sắp xóa đơn hàng <strong>#{orderToDelete.order_code}</strong> của khách hàng <strong>{orderToDelete.customer_name}</strong>. Thao tác này sẽ xóa vĩnh viễn dữ liệu đơn hàng.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id)
                  setOrderToDelete(null)
                }}
                className="px-4 py-2 rounded-2xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all active:scale-95"
              >
                Xóa Đơn Hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
