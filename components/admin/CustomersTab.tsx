'use client'

import React, { useState, useMemo } from 'react'
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
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkle,
  Copy
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

function isOrderOfCustomer(o: InstallationOrder, c: Customer | null | undefined): boolean {
  if (!c || !o) return false
  if (c.id && o.customer_id && o.customer_id === c.id) return true
  if (
    c.phone &&
    o.customer_phone &&
    c.phone.trim() !== '' &&
    o.customer_phone.trim() !== '' &&
    o.customer_phone.trim() === c.phone.trim()
  ) {
    return true
  }
  return false
}

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
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(false)
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

  const handleToggleVip = async (cust: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const newTier = cust.tier === 'vip' ? 'standard' : 'vip'
    await onSaveCustomer({
      ...cust,
      id: cust.id,
      tier: newTier,
    })
  }

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
    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên khách hàng / đơn vị.')
      return
    }

    onSaveCustomer({
      ...(editingCustomer ? { id: editingCustomer.id } : {}),
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      phone_secondary: formData.phone_secondary.trim(),
      zalo: formData.zalo.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      tax_code: formData.tax_code.trim(),
      idcard: formData.idcard.trim(),
      notes: formData.notes.trim(),
    })

    setIsModalOpen(false)
  }

  // Deduplication helper: Check and merge customers with identical phone numbers
  const duplicatePhoneCount = useMemo(() => {
    const phones = new Map<string, number>()
    customers.forEach((c) => {
      const cleanPhone = c.phone?.trim()
      if (cleanPhone) {
        phones.set(cleanPhone, (phones.get(cleanPhone) || 0) + 1)
      }
    })
    let duplicates = 0
    phones.forEach((count) => {
      if (count > 1) duplicates += count - 1
    })
    return duplicates
  }, [customers])

  const handleDeduplicate = () => {
    if (duplicatePhoneCount === 0) {
      alert('Tuyệt vời! Danh sách khách hàng hiện không có số điện thoại nào bị trùng lặp.')
      return
    }

    const confirmMsg = `Hệ thống tìm thấy ${duplicatePhoneCount} bản ghi trùng lặp số điện thoại.\n\nBạn có muốn tự động gộp các bản ghi này (giữ lại hồ sơ mới nhất và đầy đủ thông tin nhất) không?`
    if (!confirm(confirmMsg)) return

    // Group by phone
    const seenPhones = new Set<string>()
    const uniqueList: Customer[] = []
    const toDeleteIds: string[] = []

    customers.forEach((c) => {
      const phone = c.phone?.trim()
      if (!phone) {
        uniqueList.push(c)
      } else if (!seenPhones.has(phone)) {
        seenPhones.add(phone)
        uniqueList.push(c)
      } else {
        toDeleteIds.push(c.id)
      }
    })

    // Execute deletion of duplicate IDs
    toDeleteIds.forEach((id) => {
      onDeleteCustomer(id)
    })

    alert(`Đã làm sạch thành công! Đã loại bỏ ${toDeleteIds.length} bản ghi trùng lặp.`)
    if (onRefreshData) onRefreshData()
  }

  // Handle Sync from Posts
  const handleSyncFromPosts = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/admin/sync-posts', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.ok) {
        alert(data.message || 'Đồng bộ khách hàng thành công!')
        if (onRefreshData) onRefreshData()
      } else {
        alert(data.error || 'Lỗi khi đồng bộ khách hàng.')
      }
    } catch {
      alert('Lỗi kết nối máy chủ.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Filter & sort
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
        const ordersA = orders.filter((o) => isOrderOfCustomer(o, a))
        const ordersB = orders.filter((o) => isOrderOfCustomer(o, b))
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

  // Linked orders for viewingCustomer
  const viewingCustomerOrders = useMemo(() => {
    if (!viewingCustomer) return []
    return orders.filter((o) => isOrderOfCustomer(o, viewingCustomer))
  }, [orders, viewingCustomer])

  // Active warranties for viewing customer
  const viewingCustomerActiveWarranties = useMemo(() => {
    return viewingCustomerOrders.filter((o) => o.status === 'completed' || o.status === 'in_progress')
  }, [viewingCustomerOrders])

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner - Apple Light Style */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                Quản Lý Khách Hàng & Đối Tác
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0071E3] border border-blue-200/60">
                {customers.length} hồ sơ
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
              Hệ thống CRM danh bạ khách hàng, địa bàn thi công & lịch sử hợp đồng tại TP. Huế
            </p>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {duplicatePhoneCount > 0 && (
            <button
              onClick={handleDeduplicate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold rounded-2xl border border-amber-200/80 transition-all shadow-2xs active:scale-[0.98]"
              title="Phát hiện và tự động gộp các khách hàng trùng SĐT"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Lọc Trùng ({duplicatePhoneCount})</span>
            </button>
          )}

          <button
            onClick={handleSyncFromPosts}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50"
            title="Đồng bộ khách hàng từ bài viết công trình"
          >
            <RefreshCw className={cn("w-4 h-4 text-slate-500", isSyncing && "animate-spin text-[#0071E3]")} />
            <span className="hidden sm:inline">Đồng Bộ</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards - Responsive 2x2 on Mobile, 4 Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Khách Hàng</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {customerStats.total}
            </span>
            <span className="text-xs text-slate-500">hồ sơ</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh Nghiệp / KS</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
              {customerStats.businesses}
            </span>
            <span className="text-xs text-slate-500">đơn vị</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách Hàng VIP ⭐</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">
              {customerStats.vips}
            </span>
            <span className="text-xs text-slate-500">thân thiết</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh Thu TB / Khách</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-bold text-purple-700 font-mono tabular-nums truncate block">
              {formatVND(customerStats.averageSpent)}
            </span>
            <span className="text-[11px] text-slate-500">Giá trị hợp đồng</span>
          </div>
        </div>
      </div>

      {/* Multi-layer Search & Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        {/* Row 1: Segmented Type Filter Tabs & Active Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar gap-1 max-w-full">
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

          {(searchQuery || typeFilter !== 'all' || districtFilter !== 'all' || sortBy !== 'newest') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setTypeFilter('all')
                setDistrictFilter('all')
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

        {/* Row 2: Search Input + Ward Select + Sort Select */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Bar */}
          <div className="relative sm:col-span-6 lg:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm tên khách hàng, SĐT, Zalo, địa chỉ..."
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

          {/* District / Ward Select */}
          <div className="relative sm:col-span-3 lg:col-span-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-7 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer truncate font-medium"
            >
              <option value="all">Tất cả Phường/Xã tại Huế</option>
              {HUE_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative sm:col-span-3 lg:col-span-3">
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
              <option value="spent_desc">Chi tiêu cao nhất (LTV)</option>
              <option value="orders_desc">Nhiều đơn thi công nhất</option>
              <option value="name_asc">Tên theo thứ tự A - Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Customer List: Responsive Table for Desktop + Touch Cards for Mobile */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4 min-w-[240px]">Khách Hàng & Phân Hạng</th>
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
                  const custOrders = orders.filter((o) => isOrderOfCustomer(o, cust))
                  const totalSpent = custOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                  const tierInfo = CUSTOMER_TIERS[cust.tier || 'standard'] || CUSTOMER_TIERS.standard

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => {
                        setViewingCustomer(cust)
                        setIsOrdersExpanded(false)
                      }}
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

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                                {cust.name}
                              </span>

                              {/* VIP Star Toggle */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleVip(cust, e)}
                                className={cn(
                                  'p-0.5 rounded hover:scale-110 transition-transform',
                                  cust.tier === 'vip' ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                                )}
                                title={cust.tier === 'vip' ? 'Khách hàng VIP (Bấm để đổi)' : 'Đặt làm khách hàng VIP'}
                              >
                                <Star className={cn('w-3.5 h-3.5', cust.tier === 'vip' && 'fill-amber-400')} />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn('text-[10px] font-semibold px-2 py-0.2 rounded-full border', tierInfo.badgeClass)}>
                                {tierInfo.label}
                              </span>
                              {cust.tax_code && (
                                <span className="text-[10.5px] font-mono text-[#86868B] bg-slate-100 px-1.5 py-0.2 rounded">
                                  MST: {cust.tax_code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Direct Contact */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {cust.phone ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${cust.phone.replace(/\s+/g, '')}`}
                                className="font-mono font-semibold text-slate-800 hover:text-[#0071E3] flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-[#0071E3]" />
                                {cust.phone}
                              </a>
                              {cust.zalo && (
                                <a
                                  href={`https://zalo.me/${cust.zalo.replace(/\s+/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#0071E3] border border-blue-200 hover:bg-[#0071E3] hover:text-white transition-colors"
                                >
                                  Zalo
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa có SĐT</span>
                          )}

                          {cust.email && (
                            <p className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
                              {cust.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Address & Ward */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-medium">
                            📍 {cust.district || 'TP. Huế'}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]" title={cust.address}>
                            {cust.address || 'Chưa cập nhật địa chỉ'}
                          </p>
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800">
                          <ClipboardList className="w-3 h-3 text-slate-500" />
                          {custOrders.length}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {formatVND(totalSpent)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {onOpenNewOrderWithCustomer && (
                            <button
                              type="button"
                              onClick={() => onOpenNewOrderWithCustomer(cust)}
                              className="p-1.5 rounded-xl bg-blue-50 text-[#0071E3] hover:bg-blue-100 transition-colors"
                              title="Tạo đơn hàng mới cho khách này"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setViewingCustomer(cust)
                              setIsOrdersExpanded(false)
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-[#0071E3] hover:bg-blue-50 transition-colors"
                            title="Xem hồ sơ 360"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomerToDelete(cust)}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa hồ sơ"
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

        {/* Mobile Cards View (Visible only on mobile) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedCustomers.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#1D1D1F]">Không tìm thấy khách hàng</p>
              <p className="text-xs text-[#86868B]">Thử tìm kiếm hoặc thêm khách hàng mới.</p>
            </div>
          ) : (
            paginatedCustomers.map((cust) => {
              const custOrders = orders.filter((o) => isOrderOfCustomer(o, cust))
              const totalSpent = custOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
              const tierInfo = CUSTOMER_TIERS[cust.tier || 'standard'] || CUSTOMER_TIERS.standard

              return (
                <div
                  key={cust.id}
                  className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors"
                  onClick={() => {
                    setViewingCustomer(cust)
                    setIsOrdersExpanded(false)
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border',
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
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {cust.name}
                          </h4>
                          {cust.tier === 'vip' && (
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <span className={cn('text-[10px] font-semibold px-2 py-0.2 rounded-full border inline-block mt-0.5', tierInfo.badgeClass)}>
                          {tierInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs text-slate-900 block">
                        {formatVND(totalSpent)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {custOrders.length} đơn hàng
                      </span>
                    </div>
                  </div>

                  {/* Direct Action Chips */}
                  <div className="flex items-center gap-2 text-xs flex-wrap" onClick={(e) => e.stopPropagation()}>
                    {cust.phone ? (
                      <>
                        <a
                          href={`tel:${cust.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-[#0071E3] border border-blue-200 font-semibold text-xs"
                        >
                          <PhoneCall className="w-3 h-3" />
                          {cust.phone}
                        </a>
                        {cust.zalo && (
                          <a
                            href={`https://zalo.me/${cust.zalo.replace(/\s+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Zalo
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Chưa có SĐT</span>
                    )}

                    <span className="text-slate-500 text-[11px] truncate">
                      📍 {cust.district || 'TP. Huế'}
                    </span>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    {onOpenNewOrderWithCustomer && (
                      <button
                        type="button"
                        onClick={() => onOpenNewOrderWithCustomer(cust)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#0071E3] font-semibold text-xs flex items-center gap-1"
                      >
                        <Wrench className="w-3 h-3" />
                        Tạo đơn
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(cust)}
                      className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-amber-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerToDelete(cust)}
                      className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
          totalItems={filteredCustomers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          itemLabel="khách hàng"
          onPageChange={(page) => setCurrentPage(page)}
          className="rounded-t-none border-x-0 border-b-0 border-t bg-slate-50/50"
        />
      </div>

      {/* CUSTOMER 360 PROFILE VIEW MODAL */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {viewingCustomer.name}
                    </h3>
                    {viewingCustomer.tier === 'vip' && (
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        VIP ⭐
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Hồ sơ khách hàng 360 · {viewingCustomer.district || 'TP. Huế'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingCustomer(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Quick Action Button Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                {viewingCustomer.phone ? (
                  <a
                    href={`tel:${viewingCustomer.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-200/80 font-semibold text-xs hover:bg-[#0071E3] hover:text-white transition-all shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Gọi: {viewingCustomer.phone}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      const cust = viewingCustomer
                      setViewingCustomer(null)
                      openEditModal(cust)
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 text-slate-500 hover:text-[#0071E3] border border-slate-200 font-medium text-xs hover:bg-blue-50 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    + Thêm Số Điện Thoại
                  </button>
                )}

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
                  href={`https://maps.google.com/?q=${encodeURIComponent((viewingCustomer.address || 'TP. Huế') + ', TP. Huế')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200/80 font-medium text-xs hover:bg-slate-200 transition-all shadow-2xs"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0071E3] text-white font-semibold text-xs hover:bg-[#0077ED] transition-all shadow-xs sm:ml-auto"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Tạo Đơn Hàng Mới
                  </button>
                )}
              </div>

              {/* 3 Metric Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-slate-500 block">Tổng Chi Tiêu (LTV):</span>
                  <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                    {formatVND(
                      viewingCustomerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Tổng Đơn Thi Công:</span>
                  <span className="text-base font-bold text-[#0071E3] font-mono tabular-nums">
                    {viewingCustomerOrders.length} đơn hàng
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Đang Hiệu Lực Bảo Hành:</span>
                  <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {viewingCustomerActiveWarranties.length} hệ thống
                  </span>
                </div>
              </div>

              {/* Contact & Business Info */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Thông Tin Địa Bàn & Định Danh
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-slate-500">Khu vực địa bàn:</span>{' '}
                    <span className="font-semibold text-slate-900">{viewingCustomer.district || 'TP. Huế'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Địa chỉ thi công:</span>{' '}
                    <span className="font-semibold text-slate-900">{viewingCustomer.address}</span>
                  </div>
                  {viewingCustomer.tax_code && (
                    <div>
                      <span className="text-slate-500">Mã số thuế:</span>{' '}
                      <span className="font-mono font-semibold text-[#0071E3]">{viewingCustomer.tax_code}</span>
                    </div>
                  )}
                  {viewingCustomer.email && (
                    <div>
                      <span className="text-slate-500">Email:</span>{' '}
                      <span className="font-mono text-slate-900">{viewingCustomer.email}</span>
                    </div>
                  )}
                  {viewingCustomer.phone_secondary && (
                    <div>
                      <span className="text-slate-500">SĐT dự phòng:</span>{' '}
                      <span className="font-mono text-slate-900">{viewingCustomer.phone_secondary}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Ngày tham gia:</span>{' '}
                    <span className="font-mono text-slate-900">{formatDateVN(viewingCustomer.created_at)}</span>
                  </div>
                </div>

                {viewingCustomer.notes && (
                  <div className="pt-2 border-t border-slate-200/60 mt-2">
                    <span className="text-slate-500 block mb-0.5">Ghi chú nghiệp vụ / Yêu cầu kỹ thuật:</span>
                    <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60">
                      {viewingCustomer.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Linked Orders History */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#0071E3]" />
                    Lịch Sử Đơn Hàng & Hợp Đồng ({viewingCustomerOrders.length})
                  </h4>

                  {viewingCustomerOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-all"
                    >
                      {isOrdersExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          <span>Thu gọn</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-[#0071E3]" />
                          <span className="text-[#0071E3]">Xem chi tiết ({viewingCustomerOrders.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {viewingCustomerOrders.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-50/50 rounded-2xl border border-slate-200/60">
                    Khách hàng này chưa có đơn hàng nào trong hệ thống.
                  </div>
                ) : !isOrdersExpanded ? (
                  <div
                    onClick={() => setIsOrdersExpanded(true)}
                    className="p-3.5 bg-blue-50/60 border border-blue-200/70 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0071E3] flex items-center justify-center shrink-0 font-bold text-xs">
                        {viewingCustomerOrders.length}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          Đang thu gọn {viewingCustomerOrders.length} đơn hàng thi công
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Bấm để xem chi tiết từng thiết bị, ngày hoàn thành & bảo hành
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#0071E3] group-hover:underline inline-flex items-center gap-1 shrink-0">
                      Mở rộng <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-150">
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

                          <div className="text-xs text-slate-800 space-y-1">
                            <p className="font-medium">
                              ⚙️ <strong>Thiết bị:</strong> {ord.equipment_list}
                            </p>
                            {ord.notes && (
                              <p className="text-slate-500 text-[11.5px]">
                                📝 {ord.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11.5px] text-slate-500 border-t border-slate-100 pt-2 flex-wrap gap-2">
                            <span>
                              Thi công: <strong className="text-slate-900">{ord.installation_date}</strong> · Bảo hành đến: <strong className="text-[#0071E3]">{ord.warranty_until}</strong>
                            </span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
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
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex items-center justify-between">
              <button
                onClick={() => {
                  const cust = viewingCustomer
                  setViewingCustomer(null)
                  openEditModal(cust)
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl text-xs font-semibold border border-slate-200 transition-all inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh Sửa Hồ Sơ
              </button>

              <button
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-semibold shadow-xs transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCustomer ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">Lưu trữ thông tin vào cơ sở dữ liệu Camera 247 Huế</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Customer Type & Tier Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Phân loại đối tượng *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'individual' })}
                      className={cn(
                        'py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                        formData.type === 'individual'
                          ? 'bg-blue-50 border-[#0071E3] text-[#0071E3] shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <User className="w-3.5 h-3.5" />
                      Cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'business' })}
                      className={cn(
                        'py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                        formData.type === 'business'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <Building className="w-3.5 h-3.5" />
                      Doanh nghiệp
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Hạng khách hàng
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tier: 'standard' })}
                      className={cn(
                        'py-2 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all',
                        formData.tier === 'standard'
                          ? 'bg-blue-50 border-[#0071E3] text-[#0071E3] shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      )}
                    >
                      Tiêu chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tier: 'vip' })}
                      className={cn(
                        'py-2 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all flex items-center justify-center gap-0.5',
                        formData.tier === 'vip'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      )}
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tier: 'potential' })}
                      className={cn(
                        'py-2 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all',
                        formData.tier === 'potential'
                          ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      )}
                    >
                      Tiềm năng
                    </button>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Tên khách hàng / Đơn vị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Anh Nam, Khách Sạn Hương Giang..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-semibold transition-all"
                />
              </div>

              {/* Phone & Zalo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Số điện thoại chính
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0982 929 088"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Số Zalo tư vấn
                  </label>
                  <input
                    type="tel"
                    value={formData.zalo}
                    onChange={(e) => setFormData({ ...formData, zalo: e.target.value })}
                    placeholder="0984 929 088"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Ward & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Khu vực Phường/Xã tại Huế
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  >
                    {HUE_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Địa chỉ chi tiết (Số nhà, đường)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="40 Tùng Thiện Vương, Vỹ Dạ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Email & Tax Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="khachhang@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Mã số thuế (Doanh nghiệp)
                  </label>
                  <input
                    type="text"
                    value={formData.tax_code}
                    onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                    placeholder="3301677400"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Ghi chú nghiệp vụ
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Yêu cầu riêng của khách, thời gian liên hệ thuận tiện..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 resize-none transition-all"
                />
              </div>

              {/* Modal Actions */}
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
                  {editingCustomer ? 'Lưu Thay Đổi' : 'Thêm Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa hồ sơ khách hàng?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn sắp xóa khách hàng <strong>{customerToDelete.name}</strong> ({customerToDelete.phone || 'Không có SĐT'}). Thao tác này sẽ gỡ bỏ khách hàng khỏi danh bạ.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCustomer(customerToDelete.id)
                  setCustomerToDelete(null)
                }}
                className="px-4 py-2 rounded-2xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all active:scale-95"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
