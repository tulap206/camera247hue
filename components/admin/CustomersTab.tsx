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
  PhoneCall,
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
  MessageCircle,
  Download,
  Star,
  ExternalLink,
  Wrench,
  Mail,
  Receipt,
  Sparkles,
  ArrowUpDown,
  Filter,
  Layers,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import { formatVND, formatDateVN } from '@/lib/formatters'
import type { Customer, InstallationOrder } from '@/lib/camera247-data'
import { HUE_DISTRICTS, CUSTOMER_TIERS, ORDER_STATUS_CONFIG } from '@/lib/camera247-data'
import { cn } from '@/lib/utils'
import PaginationControl from './PaginationControl'

interface CustomersTabProps {
  customers: Customer[]
  orders: InstallationOrder[]
  onSaveCustomer: (customer: Partial<Customer> & { id?: string }) => void
  onDeleteCustomer: (id: string) => void
  onOpenNewOrderWithCustomer?: (customer: Customer) => void
  onRefreshData?: () => void
}

type FilterType = 'all' | 'individual' | 'business' | 'vip'
type SortOption = 'newest' | 'spent_desc' | 'orders_desc' | 'name_asc'

export function CustomersTab({
  customers,
  orders,
  onSaveCustomer,
  onDeleteCustomer,
  onOpenNewOrderWithCustomer,
  onRefreshData,
}: CustomersTabProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [districtFilter, setDistrictFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
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
    phone_secondary: '',
    zalo: '',
    email: '',
    address: '',
    district: HUE_DISTRICTS[0] as string,
    type: 'individual' as 'individual' | 'business',
    tier: 'standard' as 'standard' | 'vip' | 'potential',
    tax_code: '',
    idcard: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')

  const openCreateModal = () => {
    setEditingCustomer(null)
    setFormData({
      name: '',
      phone: '',
      phone_secondary: '',
      zalo: '',
      email: '',
      address: '',
      district: HUE_DISTRICTS[0],
      type: 'individual',
      tier: 'standard',
      tax_code: '',
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
      phone_secondary: c.phone_secondary || '',
      zalo: c.zalo || '',
      email: c.email || '',
      address: c.address || '',
      district: c.district || HUE_DISTRICTS[0],
      type: c.type || 'individual',
      tier: c.tier || 'standard',
      tax_code: c.tax_code || '',
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
      phone_secondary: formData.phone_secondary.trim(),
      zalo: formData.zalo.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      district: formData.district,
      type: formData.type,
      tier: formData.tier,
      tax_code: formData.tax_code.trim(),
      idcard: formData.idcard.trim(),
      notes: formData.notes.trim(),
    })

    setIsModalOpen(false)
  }

  // Export Customer List to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'Mã KH',
        'Tên Khách Hàng',
        'Số Điện Thoại',
        'SĐT Phụ',
        'Zalo',
        'Email',
        'Địa Chỉ',
        'Khu Vực',
        'Loại KH',
        'Hạng KH',
        'Mã Số Thuế',
        'Tổng Số Đơn',
        'Tổng Chi Tiêu (VND)',
        'Ghi Chú',
        'Ngày Tạo',
      ]

      const rows = filteredCustomers.map((c) => {
        const custOrders = orders.filter(
          (o) => o.customer_id === c.id || o.customer_phone === c.phone
        )
        const totalSpent = custOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        return [
          `"${c.id}"`,
          `"${(c.name || '').replace(/"/g, '""')}"`,
          `"${c.phone || ''}"`,
          `"${c.phone_secondary || ''}"`,
          `"${c.zalo || ''}"`,
          `"${c.email || ''}"`,
          `"${(c.address || '').replace(/"/g, '""')}"`,
          `"${c.district || ''}"`,
          `"${c.type === 'business' ? 'Doanh nghiệp' : 'Cá nhân'}"`,
          `"${c.tier || 'standard'}"`,
          `"${c.tax_code || ''}"`,
          custOrders.length,
          totalSpent,
          `"${(c.notes || '').replace(/"/g, '""')}"`,
          `"${formatDateVN(c.created_at)}"`,
        ].join(',')
      })

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const dateTag = new Date().toISOString().split('T')[0]
      link.href = url
      link.download = `danh-ba-khach-hang-camera247-${dateTag}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert('Lỗi xuất file CSV: ' + err.message)
    }
  }

  // Filter & Search & Sort
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return customers
      .filter((c) => {
        const matchSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.phone_secondary && c.phone_secondary.toLowerCase().includes(q)) ||
          (c.zalo && c.zalo.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.tax_code && c.tax_code.toLowerCase().includes(q)) ||
          c.address.toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))

        let matchType = true
        if (typeFilter === 'individual') matchType = c.type === 'individual'
        else if (typeFilter === 'business') matchType = c.type === 'business'
        else if (typeFilter === 'vip') matchType = c.tier === 'vip'

        const matchDistrict = districtFilter === 'all' || c.district === districtFilter

        return matchSearch && matchType && matchDistrict
      })
      .sort((a, b) => {
        const ordersA = orders.filter((o) => o.customer_id === a.id || o.customer_phone === a.phone)
        const ordersB = orders.filter((o) => o.customer_id === b.id || o.customer_phone === b.phone)
        const spentA = ordersA.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        const spentB = ordersB.reduce((sum, o) => sum + (o.total_amount || 0), 0)

        if (sortBy === 'spent_desc') return spentB - spentA
        if (sortBy === 'orders_desc') return ordersB.length - ordersA.length
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'vi')
        // default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [customers, orders, searchQuery, typeFilter, districtFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE))
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredCustomers, currentPage])

  // Customer stats
  const customerStats = useMemo(() => {
    const total = customers.length
    const businesses = customers.filter((c) => c.type === 'business').length
    const individuals = customers.filter((c) => c.type === 'individual').length
    const vips = customers.filter((c) => c.tier === 'vip').length

    let totalRevenueAll = 0
    orders.forEach((o) => {
      if (o.status !== 'cancelled') {
        totalRevenueAll += o.total_amount || 0
      }
    })
    const averageSpent = total > 0 ? Math.round(totalRevenueAll / total) : 0

    return { total, businesses, individuals, vips, totalRevenueAll, averageSpent }
  }, [customers, orders])

  // Orders linked to viewing customer
  const viewingCustomerOrders = useMemo(() => {
    if (!viewingCustomer) return []
    return orders.filter(
      (o) => o.customer_id === viewingCustomer.id || o.customer_phone === viewingCustomer.phone
    )
  }, [orders, viewingCustomer])

  const viewingCustomerActiveWarranties = useMemo(() => {
    return viewingCustomerOrders.filter((o) => o.status === 'warranty' || o.status === 'completed')
  }, [viewingCustomerOrders])

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
            <Users className="w-4 h-4" />
            <span>Customer Relationship Management (CRM)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight mt-1">
            Hồ Sơ & Danh Bạ Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1">
            Quản lý thông tin đối tác, khách hàng cá nhân & dự án doanh nghiệp thi công tại Thừa Thiên Huế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleSyncFromPosts}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#0071E3] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-blue-200/80 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50"
            title="Tự động đồng bộ và trích xuất khách hàng từ tất cả các bài viết công trình"
          >
            <RefreshCw className={cn("w-4 h-4 text-[#0071E3]", isSyncing && "animate-spin")} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Từ Bài Viết'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
            title="Tải về danh sách khách hàng định dạng CSV"
          >
            <Download className="w-4 h-4 text-[#86868B]" />
            <span>Xuất Danh Bạ (.CSV)</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khách Hàng Mới</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards (Apple Squircle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-200/60 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Tổng Khách Hàng
            </span>
            <span className="text-2xl font-bold text-[#1D1D1F] font-mono tabular-nums">
              {customerStats.total}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Doanh Nghiệp / Khách Sạn
            </span>
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {customerStats.businesses}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Khách Hàng VIP ⭐
            </span>
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {customerStats.vips}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#86868B] uppercase font-bold tracking-wider block">
              Doanh Thu TB / Khách
            </span>
            <span className="text-lg sm:text-xl font-bold text-indigo-700 font-mono tabular-nums">
              {formatVND(customerStats.averageSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-layer Search & Segmented Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Apple Segmented Control for Category */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 self-start lg:self-auto max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setTypeFilter('all')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
              typeFilter === 'all'
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            Tất cả ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('individual')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              typeFilter === 'individual'
                ? 'bg-white text-[#0071E3] font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <User className="w-3.5 h-3.5" />
            Cá nhân ({customerStats.individuals})
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('business')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              typeFilter === 'business'
                ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <Building className="w-3.5 h-3.5" />
            Doanh nghiệp ({customerStats.businesses})
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('vip')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              typeFilter === 'vip'
                ? 'bg-white text-amber-700 font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            VIP ⭐ ({customerStats.vips})
          </button>
        </div>

        {/* Search & Location/Sort Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-1 lg:max-w-2xl">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm tên, SĐT, Zalo, MST, địa chỉ..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0"
          >
            <option value="all">Tất cả khu vực tại Huế</option>
            {HUE_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
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
            <option value="spent_desc">Chi tiêu cao nhất (LTV)</option>
            <option value="orders_desc">Nhiều đơn thi công nhất</option>
            <option value="name_asc">Tên theo thứ tự A - Z</option>
          </select>
        </div>
      </div>

      {/* Enhanced Apple Customer Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4 min-w-[220px]">Khách Hàng & Phân Hạng</th>
                <th className="py-3.5 px-4 min-w-[190px]">Liên Hệ Trực Tiếp</th>
                <th className="py-3.5 px-4 min-w-[200px]">Địa Bàn & Địa Chỉ</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Đơn Thi Công</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Tổng Hợp Đồng</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap w-28">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#1D1D1F]">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center space-y-2">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-[#1D1D1F]">Không tìm thấy khách hàng phù hợp</p>
                    <p className="text-xs text-[#86868B]">Thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm khách hàng mới.</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust, idx) => {
                  const custOrders = orders.filter(
                    (o) => o.customer_id === cust.id || o.customer_phone === cust.phone
                  )
                  const totalSpent = custOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                  const tierInfo = CUSTOMER_TIERS[cust.tier || 'standard'] || CUSTOMER_TIERS.standard

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setViewingCustomer(cust)}
                    >
                      {/* Index */}
                      <td className="py-4 px-4 text-center font-mono text-[#86868B] text-[11px]">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>

                      {/* Customer Name & Identification */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5',
                              cust.type === 'business'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-[#0071E3] border-blue-200'
                            )}
                          >
                            {cust.type === 'business' ? (
                              <Building className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#1D1D1F] text-sm group-hover:text-[#0071E3] transition-colors line-clamp-1">
                                {cust.name}
                              </span>
                              {cust.tier === 'vip' && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> VIP
                                </span>
                              )}
                            </div>

                            {cust.tax_code && (
                              <p className="text-[11px] text-[#86868B] font-mono mt-0.5">
                                MST: <span className="text-[#1D1D1F]">{cust.tax_code}</span>
                              </p>
                            )}

                            {cust.notes && (
                              <p className="text-[11.5px] text-[#86868B] line-clamp-1 mt-0.5">
                                {cust.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Direct Contact Hub */}
                      <td className="py-4 px-4">
                        <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 flex-wrap">
                            {cust.phone ? (
                              <>
                                <a
                                  href={`tel:${cust.phone.replace(/\s+/g, '')}`}
                                  className="font-mono font-semibold text-[#1D1D1F] hover:text-[#0071E3] inline-flex items-center gap-1 transition-colors text-xs"
                                  title="Bấm để gọi điện"
                                >
                                  <Phone className="w-3 h-3 text-[#0071E3]" />
                                  {cust.phone}
                                </a>

                                {cust.zalo && (
                                  <a
                                    href={`https://zalo.me/${cust.zalo.replace(/\s+/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-blue-50 text-[#0071E3] border border-blue-200 text-[10.5px] font-semibold hover:bg-[#0071E3] hover:text-white transition-all shadow-2xs"
                                    title="Mở Zalo nhắn tin trực tiếp"
                                  >
                                    💬 Zalo
                                  </a>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-400 italic text-[11px] inline-flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-300" />
                                Chưa cập nhật SĐT
                              </span>
                            )}
                          </div>


                          {cust.phone_secondary && (
                            <p className="text-[11px] text-[#86868B] font-mono">
                              Phụ: {cust.phone_secondary}
                            </p>
                          )}

                          {cust.email && (
                            <p className="text-[11px] text-[#86868B] truncate max-w-[170px]">
                              ✉️ {cust.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* District & Full Address */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="inline-block text-[10.5px] font-semibold bg-slate-100 text-[#1D1D1F] px-2 py-0.5 rounded-md border border-slate-200/80">
                            📍 {cust.district || 'TP. Huế'}
                          </span>
                          <p className="text-xs text-[#424245] line-clamp-2 leading-relaxed">
                            {cust.address}
                          </p>
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-[#1D1D1F] font-mono tabular-nums text-sm">
                          {custOrders.length}
                        </span>
                        <span className="text-[11px] text-[#86868B] ml-1">đơn</span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-emerald-700 font-mono tabular-nums text-sm">
                          {formatVND(totalSpent)}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingCustomer(cust)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-[#0071E3] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                            title="Xem hồ sơ chi tiết 360°"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onOpenNewOrderWithCustomer && (
                            <button
                              onClick={() => onOpenNewOrderWithCustomer(cust)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all"
                              title="Tạo đơn thi công mới cho khách này"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setCustomerToDelete(cust)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                            title="Xóa hồ sơ"
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
          totalItems={filteredCustomers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          itemLabel="khách hàng"
          onPageChange={(page) => setCurrentPage(page)}
          className="rounded-t-none border-x-0 border-b-0 border-t bg-slate-50/50"
        />

      </div>

      {/* Customer 360° Dossier Sheet Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border',
                    viewingCustomer.type === 'business'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-[#0071E3] border-blue-200'
                  )}
                >
                  {viewingCustomer.type === 'business' ? (
                    <Building className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F]">
                      {viewingCustomer.name}
                    </h3>
                    {viewingCustomer.tier === 'vip' && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Khách Hàng VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    {viewingCustomer.type === 'business' ? 'Khách hàng Doanh nghiệp / Tổ chức' : 'Khách hàng Cá nhân / Hộ gia đình'} · Mã KH: <span className="font-mono">{viewingCustomer.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Action Button Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`tel:${viewingCustomer.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-200/80 font-semibold text-xs hover:bg-[#0071E3] hover:text-white transition-all shadow-2xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Gọi: {viewingCustomer.phone}
                </a>

                {viewingCustomer.zalo && (
                  <a
                    href={`https://zalo.me/${viewingCustomer.zalo.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold text-xs hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat Zalo: {viewingCustomer.zalo}
                  </a>
                )}

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(viewingCustomer.address + ', Huế')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 text-[#1D1D1F] border border-slate-200/80 font-medium text-xs hover:bg-slate-200 transition-all shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Mở Google Maps
                </a>

                {onOpenNewOrderWithCustomer && (
                  <button
                    onClick={() => {
                      onOpenNewOrderWithCustomer(viewingCustomer)
                      setViewingCustomer(null)
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0071E3] text-white font-semibold text-xs hover:bg-[#0077ED] transition-all shadow-[0_2px_8px_rgba(0,113,227,0.25)] ml-auto"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Tạo Đơn Hàng Mới
                  </button>
                )}
              </div>

              {/* 3 Overview Metric Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-[#86868B] block">Tổng Chi Tiêu (LTV):</span>
                  <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                    {formatVND(
                      viewingCustomerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#86868B] block">Tổng Đơn Thi Công:</span>
                  <span className="text-base font-bold text-[#0071E3] font-mono tabular-nums">
                    {viewingCustomerOrders.length} đơn hàng
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#86868B] block">Đang Hiệu Lực Bảo Hành:</span>
                  <span className="text-base font-bold text-[#1D1D1F] font-mono tabular-nums">
                    {viewingCustomerActiveWarranties.length} hệ thống
                  </span>
                </div>
              </div>

              {/* Contact & Business Info */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <p className="text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
                  Thông Tin Địa Bàn & Định Danh
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#86868B]">Khu vực địa bàn:</span>{' '}
                    <span className="font-semibold text-[#1D1D1F]">{viewingCustomer.district || 'TP. Huế'}</span>
                  </div>
                  <div>
                    <span className="text-[#86868B]">Địa chỉ thi công:</span>{' '}
                    <span className="font-semibold text-[#1D1D1F]">{viewingCustomer.address}</span>
                  </div>
                  {viewingCustomer.tax_code && (
                    <div>
                      <span className="text-[#86868B]">Mã số thuế:</span>{' '}
                      <span className="font-mono font-semibold text-[#0071E3]">{viewingCustomer.tax_code}</span>
                    </div>
                  )}
                  {viewingCustomer.email && (
                    <div>
                      <span className="text-[#86868B]">Email:</span>{' '}
                      <span className="font-mono text-[#1D1D1F]">{viewingCustomer.email}</span>
                    </div>
                  )}
                  {viewingCustomer.phone_secondary && (
                    <div>
                      <span className="text-[#86868B]">SĐT dự phòng:</span>{' '}
                      <span className="font-mono text-[#1D1D1F]">{viewingCustomer.phone_secondary}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#86868B]">Ngày tham gia:</span>{' '}
                    <span className="font-mono text-[#1D1D1F]">{formatDateVN(viewingCustomer.created_at)}</span>
                  </div>
                </div>
                {viewingCustomer.notes && (
                  <div className="pt-2 border-t border-slate-200/60 mt-2">
                    <span className="text-[#86868B] block mb-0.5">Ghi chú nghiệp vụ / Yêu cầu kỹ thuật:</span>
                    <p className="text-[#1D1D1F] font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60">
                      {viewingCustomer.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Linked Orders History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#0071E3]" />
                    Lịch Sử Đơn Hàng & Hợp Đồng Thi Công ({viewingCustomerOrders.length})
                  </h4>
                </div>

                {viewingCustomerOrders.length === 0 ? (
                  <div className="p-8 text-center text-[#86868B] text-xs bg-slate-50/50 rounded-2xl border border-slate-200/60">
                    Khách hàng này chưa có đơn hàng nào trong hệ thống.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {viewingCustomerOrders.map((ord) => {
                      const st = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending
                      return (
                        <div
                          key={ord.id}
                          className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2.5 shadow-2xs hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                              #{ord.order_code}
                            </span>
                            <span className={cn('text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border', st.badgeClass)}>
                              {st.label}
                            </span>
                          </div>

                          <div className="text-xs text-[#1D1D1F] space-y-1">
                            <p className="font-medium">
                              ⚙️ <strong>Thiết bị:</strong> {ord.equipment_list}
                            </p>
                            {ord.notes && (
                              <p className="text-[#86868B] text-[11.5px]">
                                📝 {ord.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11.5px] text-[#86868B] border-t border-slate-100 pt-2 flex-wrap gap-2">
                            <span>
                              Thi công: <strong className="text-[#1D1D1F]">{ord.installation_date}</strong> · Bảo hành đến: <strong className="text-[#0071E3]">{ord.warranty_until}</strong>
                            </span>
                            <span className="font-mono font-bold text-[#1D1D1F] text-sm">
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between">
              <button
                onClick={() => {
                  const cust = viewingCustomer
                  setViewingCustomer(null)
                  openEditModal(cust)
                }}
                className="px-4 py-2 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs font-semibold border border-slate-200 transition-all inline-flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh Sửa Hồ Sơ
              </button>

              <button
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-[#1D1D1F] text-white hover:bg-slate-800 rounded-2xl text-xs font-semibold shadow-xs transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Sheet Modal (iOS Sheet Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                    {editingCustomer ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Mới'}
                  </h3>
                  <p className="text-[11px] text-[#86868B]">Lưu trữ thông tin vào cơ sở dữ liệu Camera 247 Huế</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Tên Khách Hàng / Đơn Vị / Cơ Quan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Khách sạn Hương Giang / Anh Long (Biệt thự An Cựu)"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Type & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Phân Loại Khách Hàng
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="individual">Cá nhân / Hộ gia đình</option>
                    <option value="business">Doanh nghiệp / Khách sạn / Cơ quan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Phân Hạng Chăm Sóc
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="standard">Tiêu chuẩn</option>
                    <option value="potential">Tiềm năng</option>
                    <option value="vip">Khách hàng VIP ⭐</option>
                  </select>
                </div>
              </div>

              {/* Phone & Zalo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Số Điện Thoại Chính *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0914 xxx xxx"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Số Zalo Liên Hệ
                  </label>
                  <input
                    type="tel"
                    value={formData.zalo}
                    onChange={(e) => setFormData({ ...formData, zalo: e.target.value })}
                    placeholder="Để trống nếu trùng SĐT chính"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Secondary Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Số Điện Thoại Phụ / Quản Lý
                  </label>
                  <input
                    type="text"
                    value={formData.phone_secondary}
                    onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                    placeholder="VD: 0905 xxx xxx (Bảo vệ/Kế toán)"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Địa Chỉ Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* District & Tax Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Khu Vực Địa Bàn (Thừa Thiên Huế)
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    {HUE_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Mã Số Thuế (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={formData.tax_code}
                    onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                    placeholder="VD: 3301677400"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Địa Chỉ Chi Tiết Tại Huế *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, Tên đường, Phường/Xã..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Ghi Chú Nhu Cầu / Thiết Bị & Bảo Trì
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về dòng thiết bị đã lắp, thói quen sử dụng, thời gian tiện liên hệ..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>

              {/* Submit Bar */}
              <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                <button
                  type="submit"
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-2.5 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
                >
                  {editingCustomer ? 'Lưu Thay Đổi Hồ Sơ' : 'Tạo Hồ Sơ Khách Hàng'}
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

      {/* Delete Confirmation Sheet Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl p-6 text-center space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">Xác Nhận Xóa Hồ Sơ Khách Hàng</h3>
              <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
                Bạn có chắc chắn muốn xóa hồ sơ khách hàng <strong className="text-[#1D1D1F]">"{customerToDelete.name}"</strong> ({customerToDelete.phone}) khỏi danh bạ hệ thống?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  onDeleteCustomer(customerToDelete.id)
                  setCustomerToDelete(null)
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-2xl text-xs shadow-xs transition-colors"
              >
                Xác Nhận Xóa
              </button>
              <button
                onClick={() => setCustomerToDelete(null)}
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
