'use client'

import React, { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  MapPin,
  User,
  Trash2,
  Edit3,
  ExternalLink,
  Wrench,
  Camera,
  Compass,
  DollarSign,
  Pin,
  Check,
  CalendarCheck,
  ListFilter,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  Flame,
  AlertTriangle,
  RotateCcw,
  Copy,
  CheckCheck,
  Send,
  Share2,
  ClipboardList
} from 'lucide-react'
import {
  AdminTask,
  InstallationOrder,
  Customer,
  TASK_TYPE_CONFIG,
  TASK_PRIORITY_CONFIG,
  normalizeDateStr
} from '@/lib/camera247-data'
import { cn } from '@/lib/utils'
import PaginationControl from './PaginationControl'

interface TasksTabProps {
  tasks: AdminTask[]
  orders: InstallationOrder[]
  customers: Customer[]
  onSaveTask: (task: AdminTask) => void
  onToggleTaskStatus: (taskId: string, newStatus?: AdminTask['status']) => void
  onDeleteTask: (taskId: string) => void
  onNavigateToOrder?: (orderId: string) => void
  onNavigateToCustomer?: (customerId: string) => void
  activeUser?: 'admin' | 'admin1'
  activeDisplayName?: string
}

type ViewMode = 'calendar' | 'agenda' | 'kanban'
type StatusFilter = 'all' | 'today' | 'pending' | 'in_progress' | 'completed' | 'overdue' | 'warranty'

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

const QUICK_TITLE_PRESETS = [
  'Lắp đặt camera IP Dahua / Imou',
  'Lắp đặt camera Hikvision / Ezviz',
  'Bảo hành camera mất nguồn / mất hình',
  'Khảo sát vị trí lắp đặt camera & mạng',
  'Lắp đặt khóa cửa vân tay thông minh',
  'Cài đặt hệ thống Wifi Mesh chịu tải',
  'Thu tiền / Quyết toán đơn hàng hoàn thiện',
]

export function TasksTab({
  tasks,
  orders,
  customers,
  onSaveTask,
  onToggleTaskStatus,
  onDeleteTask,
  onNavigateToOrder,
  onNavigateToCustomer,
  activeUser = 'admin',
  activeDisplayName = 'Quản trị viên (Lập)',
}: TasksTabProps) {
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Pagination for Agenda / List View
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('08:30')
  const [formType, setFormType] = useState<AdminTask['type']>('installation')
  const [formPriority, setFormPriority] = useState<AdminTask['priority']>('high')
  const [formAssignee, setFormAssignee] = useState<'admin' | 'admin1' | 'all'>('admin')
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formCustomerPhone, setFormCustomerPhone] = useState('')
  const [formCustomerAddress, setFormCustomerAddress] = useState('')
  const [formOrderId, setFormOrderId] = useState('')
  const [formNotes, setFormNotes] = useState('')

  // Toast / Copy notification
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null)

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // KPI Calculations
  const kpis = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.date === todayStr && t.status !== 'completed')
    const pendingInstall = tasks.filter(
      (t) => t.type === 'installation' && (t.status === 'pending' || t.status === 'in_progress')
    )
    const warrantyTasks = tasks.filter((t) => t.type === 'warranty' && t.status !== 'completed')
    const completedTasks = tasks.filter((t) => t.status === 'completed')

    return {
      todayCount: todayTasks.length,
      pendingInstallCount: pendingInstall.length,
      warrantyCount: warrantyTasks.length,
      completedCount: completedTasks.length,
    }
  }, [tasks, todayStr])

  // Open Add Modal
  const handleOpenAddModal = (defaultDate?: string, defaultType?: AdminTask['type']) => {
    setEditingTask(null)
    setFormTitle('')
    setFormDate(defaultDate || selectedDateStr || todayStr)
    setFormTime('08:30')
    setFormType(defaultType || 'installation')
    setFormPriority('high')
    setFormAssignee(activeUser)
    setFormCustomerName('')
    setFormCustomerPhone('')
    setFormCustomerAddress('')
    setFormOrderId('')
    setFormNotes('')
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (task: AdminTask) => {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormDate(task.date)
    setFormTime(task.time || '08:30')
    setFormType(task.type)
    setFormPriority(task.priority)
    setFormAssignee(task.assigned_to)
    setFormCustomerName(task.customer_name || '')
    setFormCustomerPhone(task.customer_phone || '')
    setFormCustomerAddress(task.customer_address || '')
    setFormOrderId(task.order_id || '')
    setFormNotes(task.notes || '')
    setIsModalOpen(true)
  }

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDate) return

    let assignedDisplayName = 'Tất cả nhân sự'
    if (formAssignee === 'admin1') assignedDisplayName = 'Quản trị viên (Tước)'
    else if (formAssignee === 'admin') assignedDisplayName = 'Quản trị viên (Lập)'

    const taskData: AdminTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: formTitle.trim(),
      date: formDate,
      time: formTime,
      type: formType,
      priority: formPriority,
      status: editingTask ? editingTask.status : 'pending',
      assigned_to: formAssignee,
      assigned_name: assignedDisplayName,
      customer_name: formCustomerName.trim() || undefined,
      customer_phone: formCustomerPhone.trim() || undefined,
      customer_address: formCustomerAddress.trim() || undefined,
      order_id: formOrderId || undefined,
      notes: formNotes.trim() || undefined,
      is_auto_generated: editingTask?.is_auto_generated || false,
      created_at: editingTask?.created_at || new Date().toISOString(),
    }

    onSaveTask(taskData)
    setIsModalOpen(false)
  }

  // Quick Copy Task for Zalo Dispatch
  const handleCopyTaskForZalo = (task: AdminTask) => {
    const typeCfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.custom
    const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.normal
    
    const lines = [
      `📋 [CAMERA 247 HUẾ] ĐIỀU HÀNH CÔNG VIỆC`,
      `• Việc: ${typeCfg.emoji} ${task.title}`,
      `• Lịch hẹn: ${task.time ? task.time + ' - ' : ''}${task.date}`,
      `• Ưu tiên: ${priorityCfg.label}`,
      `• Phụ trách: ${task.assigned_name || 'Kỹ thuật'}`,
    ]

    if (task.customer_name) {
      lines.push(`• Khách hàng: ${task.customer_name}${task.customer_phone ? ` (${task.customer_phone})` : ''}`)
    }
    if (task.customer_address) {
      lines.push(`• Địa chỉ: ${task.customer_address}`)
    }
    if (task.order_code) {
      lines.push(`• Đơn hàng: #${task.order_code}`)
    }
    if (task.notes) {
      lines.push(`• Ghi chú: ${task.notes}`)
    }

    const text = lines.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTaskId(task.id)
      setTimeout(() => setCopiedTaskId(null), 2500)
    })
  }

  // Quick preset helper
  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    setFormDate(d.toISOString().split('T')[0])
  }

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // 1. Status Filter
        if (statusFilter === 'today') {
          if (task.date !== todayStr) return false
        } else if (statusFilter === 'pending') {
          if (task.status !== 'pending') return false
        } else if (statusFilter === 'in_progress') {
          if (task.status !== 'in_progress') return false
        } else if (statusFilter === 'completed') {
          if (task.status !== 'completed') return false
        } else if (statusFilter === 'overdue') {
          if (task.date >= todayStr || task.status === 'completed') return false
        } else if (statusFilter === 'warranty') {
          if (task.type !== 'warranty' || task.status === 'completed') return false
        }

        // 2. Type Filter
        if (typeFilter !== 'all' && task.type !== typeFilter) return false

        // 3. Assignee Filter
        if (assigneeFilter !== 'all' && task.assigned_to !== assigneeFilter) return false

        // 4. Priority Filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false

        // 5. Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim()
          const matchTitle = task.title.toLowerCase().includes(query)
          const matchCustomer = task.customer_name?.toLowerCase().includes(query)
          const matchPhone = task.customer_phone?.toLowerCase().includes(query)
          const matchAddress = task.customer_address?.toLowerCase().includes(query)
          const matchOrder = task.order_code?.toLowerCase().includes(query)
          const matchNotes = task.notes?.toLowerCase().includes(query)
          if (!matchTitle && !matchCustomer && !matchPhone && !matchAddress && !matchOrder && !matchNotes) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        // Priority order first (urgent -> high -> normal), then date
        const priorityWeight = { urgent: 3, high: 2, normal: 1 }
        const weightA = priorityWeight[a.priority] || 1
        const weightB = priorityWeight[b.priority] || 1
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }
        return weightB - weightA
      })
  }, [tasks, statusFilter, typeFilter, assigneeFilter, priorityFilter, searchQuery, todayStr])

  // Pagination calculations for Agenda view
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE))
  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredTasks, currentPage])

  // Calendar Grid Builder
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // Monday as first day of week: 0 for Mon, 6 for Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6 // Sunday is 6

    const daysInMonth = lastDayOfMonth.getDate()

    // Days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const prevDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = []
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const pMonth = month === 0 ? 12 : month
      const pYear = month === 0 ? year - 1 : year
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      prevDays.push({ dateStr, dayNum: day, isCurrentMonth: false })
    }

    // Days of current month
    const currentDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      currentDays.push({ dateStr, dayNum: day, isCurrentMonth: true })
    }

    // Days of next month to complete 35 or 42 grid cells
    const totalCells = (prevDays.length + currentDays.length) > 35 ? 42 : 35
    const nextDaysCount = totalCells - (prevDays.length + currentDays.length)
    const nextDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = []
    for (let day = 1; day <= nextDaysCount; day++) {
      const nMonth = month === 11 ? 1 : month + 2
      const nYear = month === 11 ? year + 1 : year
      const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      nextDays.push({ dateStr, dayNum: day, isCurrentMonth: false })
    }

    const allGridDays = [...prevDays, ...currentDays, ...nextDays]

    // Group tasks by date
    const tasksByDate = new Map<string, AdminTask[]>()
    tasks.forEach((task) => {
      const normDate = normalizeDateStr(task.date)
      const existing = tasksByDate.get(normDate) || []
      tasksByDate.set(normDate, [...existing, task])
    })

    // Month stats
    const monthTasks = tasks.filter((t) => {
      const norm = normalizeDateStr(t.date)
      return norm.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
    })
    const monthPending = monthTasks.filter((t) => t.status !== 'completed').length
    const monthDone = monthTasks.filter((t) => t.status === 'completed').length

    return {
      monthLabel: `Tháng ${month + 1}, ${year}`,
      monthPending,
      monthDone,
      monthTotal: monthTasks.length,
      gridDays: allGridDays.map((d) => ({
        ...d,
        tasks: tasksByDate.get(d.dateStr) || [],
        isToday: d.dateStr === todayStr,
        isSelected: d.dateStr === selectedDateStr,
      })),
    }
  }, [currentDate, tasks, todayStr, selectedDateStr])

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  const handleTodayMonth = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDateStr(now.toISOString().split('T')[0])
  }

  // Tasks for Selected Date in Calendar View
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => normalizeDateStr(t.date) === selectedDateStr)
  }, [tasks, selectedDateStr])

  const hasActiveFilters =
    statusFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    typeFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    priorityFilter !== 'all'

  const handleResetFilters = () => {
    setStatusFilter('all')
    setSearchQuery('')
    setTypeFilter('all')
    setAssigneeFilter('all')
    setPriorityFilter('all')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Apple Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0 border border-[#0071E3]/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
              Nhắc Việc & Lịch Điều Hành
            </h1>
            <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
              Lịch trình thi công, bảo hành, khảo sát và công việc toàn hệ thống Camera 247 Huế
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Apple View Mode Segmented Control */}
          <div className="flex items-center p-1 bg-[#F5F5F7] rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
                viewMode === 'calendar'
                  ? 'bg-white text-[#0071E3] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch tháng</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
                viewMode === 'agenda'
                  ? 'bg-white text-[#0071E3] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              )}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
                viewMode === 'kanban'
                  ? 'bg-white text-[#0071E3] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Việc Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Apple Squircle KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Hôm nay cần làm */}
        <div
          onClick={() => {
            setStatusFilter('today')
            setViewMode('agenda')
            setCurrentPage(1)
          }}
          className={cn(
            'cursor-pointer group relative overflow-hidden bg-white rounded-3xl p-4 sm:p-5 border transition-all active:scale-[0.99] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md',
            statusFilter === 'today' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80 hover:border-amber-300'
          )}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Hôm Nay Cần Làm
            </span>
            <span className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-200/60">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight font-mono">
              {kpis.todayCount}
            </span>
            <span className="text-xs font-semibold text-amber-600">công việc</span>
          </div>
          <p className="mt-1 text-[11px] text-[#86868B] truncate">
            Ưu tiên xử lý trong ngày hôm nay
          </p>
        </div>

        {/* KPI 2: Chờ thi công & lắp đặt */}
        <div
          onClick={() => {
            setTypeFilter('installation')
            setStatusFilter('pending')
            setViewMode('agenda')
            setCurrentPage(1)
          }}
          className={cn(
            'cursor-pointer group relative overflow-hidden bg-white rounded-3xl p-4 sm:p-5 border transition-all active:scale-[0.99] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md',
            statusFilter === 'pending' && typeFilter === 'installation'
              ? 'border-blue-400 ring-2 ring-blue-400/20'
              : 'border-slate-200/80 hover:border-blue-300'
          )}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Chờ Thi Công Lắp Đặt
            </span>
            <span className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-200/60">
              <Camera className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight font-mono">
              {kpis.pendingInstallCount}
            </span>
            <span className="text-xs font-semibold text-[#0071E3]">công trình</span>
          </div>
          <p className="mt-1 text-[11px] text-[#86868B] truncate">
            Đơn hàng cần xuất tuyến lắp đặt
          </p>
        </div>

        {/* KPI 3: Bảo hành & Bảo trì */}
        <div
          onClick={() => {
            setTypeFilter('warranty')
            setStatusFilter('all')
            setViewMode('agenda')
            setCurrentPage(1)
          }}
          className={cn(
            'cursor-pointer group relative overflow-hidden bg-white rounded-3xl p-4 sm:p-5 border transition-all active:scale-[0.99] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md',
            typeFilter === 'warranty'
              ? 'border-purple-400 ring-2 ring-purple-400/20'
              : 'border-slate-200/80 hover:border-purple-300'
          )}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Bảo Hành & Bảo Trì
            </span>
            <span className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-200/60">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight font-mono">
              {kpis.warrantyCount}
            </span>
            <span className="text-xs font-semibold text-purple-600">yêu cầu</span>
          </div>
          <p className="mt-1 text-[11px] text-[#86868B] truncate">
            Hỗ trợ kỹ thuật 24/7 tại Huế
          </p>
        </div>

        {/* KPI 4: Đã hoàn thành */}
        <div
          onClick={() => {
            setStatusFilter('completed')
            setViewMode('agenda')
            setCurrentPage(1)
          }}
          className={cn(
            'cursor-pointer group relative overflow-hidden bg-white rounded-3xl p-4 sm:p-5 border transition-all active:scale-[0.99] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md',
            statusFilter === 'completed'
              ? 'border-emerald-400 ring-2 ring-emerald-400/20'
              : 'border-slate-200/80 hover:border-emerald-300'
          )}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Đã Hoàn Thành
            </span>
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight font-mono">
              {kpis.completedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">nghiệm thu</span>
          </div>
          <p className="mt-1 text-[11px] text-[#86868B] truncate">
            Công việc đã hoàn tất nghiệm thu
          </p>
        </div>
      </div>

      {/* 2-Tier Smart Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
        {/* Tier 1: Segmented Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[#86868B] font-semibold px-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#0071E3]" /> Lọc nhanh:
          </span>
          {[
            { id: 'all' as StatusFilter, label: 'Tất cả', count: tasks.length },
            { id: 'today' as StatusFilter, label: 'Hôm nay', count: tasks.filter((t) => t.date === todayStr).length },
            { id: 'pending' as StatusFilter, label: 'Chờ xử lý', count: tasks.filter((t) => t.status === 'pending').length },
            { id: 'in_progress' as StatusFilter, label: 'Đang làm', count: tasks.filter((t) => t.status === 'in_progress').length },
            { id: 'warranty' as StatusFilter, label: 'Bảo hành', count: tasks.filter((t) => t.type === 'warranty' && t.status !== 'completed').length },
            { id: 'overdue' as StatusFilter, label: 'Quá hạn', count: tasks.filter((t) => t.date < todayStr && t.status !== 'completed').length },
            { id: 'completed' as StatusFilter, label: 'Đã xong', count: tasks.filter((t) => t.status === 'completed').length },
          ].map((item) => {
            const isActive = statusFilter === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setStatusFilter(item.id)
                  setCurrentPage(1)
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0',
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-xs'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-slate-200/80'
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#86868B]'
                  )}
                >
                  {item.count}
                </span>
              </button>
            )
          })}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-full text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 font-semibold ml-auto shrink-0"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Tier 2: Search, Task Type, Assignee, Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm việc, khách hàng, số ĐT, địa chỉ..."
              className="w-full pl-9 pr-7 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200/80 text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Select */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200/80 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            >
              <option value="all">Tất cả loại việc</option>
              <option value="installation">📷 Lắp đặt thi công</option>
              <option value="warranty">🛠️ Bảo hành / Bảo trì</option>
              <option value="survey">📐 Khảo sát & Báo giá</option>
              <option value="payment">💰 Thu hồi công nợ</option>
              <option value="custom">📌 Việc nội bộ / Khác</option>
            </select>
          </div>

          {/* Assignee Select */}
          <div>
            <select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200/80 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            >
              <option value="all">Tất cả người phụ trách</option>
              <option value="admin">Quản trị viên (Lập)</option>
              <option value="admin1">Quản trị viên (Tước)</option>
            </select>
          </div>

          {/* Priority Select */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200/80 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            >
              <option value="all">Tất cả mức ưu tiên</option>
              <option value="urgent">🔥 Khẩn cấp / Gấp</option>
              <option value="high">⚡ Ưu tiên cao</option>
              <option value="normal">⚪ Bình thường</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE APPLE CALENDAR MONTH GRID */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Calendar Header Navigation */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] capitalize">
                  {calendarGrid.monthLabel}
                </h2>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#86868B] bg-[#F5F5F7] px-2.5 py-1 rounded-xl">
                  <span>Tổng {calendarGrid.monthTotal} việc</span>
                  <span>•</span>
                  <span className="text-amber-600 font-semibold">{calendarGrid.monthPending} chờ làm</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">{calendarGrid.monthDone} xong</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTodayMonth}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F5F5F7] text-[#1D1D1F] hover:bg-slate-200/80 transition-colors"
                >
                  Hôm nay
                </button>
                <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-xl">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-white transition-colors"
                    title="Tháng trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-white transition-colors"
                    title="Tháng sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-[#F5F5F7]/70 text-center">
              {DAYS_OF_WEEK.map((d, index) => (
                <div
                  key={d}
                  className={cn(
                    'py-2 text-[11px] font-bold uppercase tracking-wider',
                    index >= 5 ? 'text-rose-500' : 'text-[#86868B]'
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Month Matrix Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/50">
              {calendarGrid.gridDays.map((cell) => {
                const isSelected = cell.dateStr === selectedDateStr
                const hasTasks = cell.tasks.length > 0
                const pendingCount = cell.tasks.filter((t) => t.status !== 'completed').length

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={cn(
                      'min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2.5 transition-all cursor-pointer relative group flex flex-col justify-between',
                      cell.isCurrentMonth
                        ? 'bg-white'
                        : 'bg-[#F5F5F7]/40 text-[#86868B]/60',
                      isSelected && 'ring-2 ring-inset ring-[#0071E3] bg-blue-50/20'
                    )}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-all',
                          cell.isToday
                            ? 'bg-[#0071E3] text-white font-bold shadow-xs'
                            : isSelected
                            ? 'bg-blue-100 text-[#0071E3] font-bold'
                            : cell.isCurrentMonth
                            ? 'text-[#1D1D1F]'
                            : 'text-[#86868B]'
                        )}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Add task quick button on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenAddModal(cell.dateStr)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F5F5F7] rounded-lg text-[#86868B] hover:text-[#0071E3] transition-all"
                        title={`Thêm việc ngày ${cell.dateStr}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Task Mini Badges in Cell */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {cell.tasks.slice(0, 2).map((t) => {
                        const typeCfg = TASK_TYPE_CONFIG[t.type] || TASK_TYPE_CONFIG.custom
                        const isDone = t.status === 'completed'
                        return (
                          <div
                            key={t.id}
                            title={`${t.time ? t.time + ' - ' : ''}${t.title}`}
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center gap-1 border transition-all',
                              isDone
                                ? 'bg-slate-100 text-[#86868B] line-through border-transparent'
                                : `${typeCfg.badgeBg} ${typeCfg.badgeText} ${typeCfg.badgeBorder}`
                            )}
                          >
                            <span>{typeCfg.emoji}</span>
                            <span className="truncate">{t.title}</span>
                          </div>
                        )
                      })}

                      {cell.tasks.length > 2 && (
                        <div className="text-[9px] sm:text-[10px] font-bold text-[#0071E3] px-1">
                          +{cell.tasks.length - 2} việc khác
                        </div>
                      )}
                    </div>

                    {/* Dot status summary */}
                    {hasTasks && cell.tasks.length <= 2 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full inline-block',
                            pendingCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                          )}
                        />
                        <span className="text-[9px] text-[#86868B] font-medium">
                          {pendingCount > 0 ? `${pendingCount} chờ` : 'Đã xong'}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Agenda for Selected Date */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                    Lịch Trình Ngày: {selectedDateStr}
                  </h3>
                  <span className="text-xs text-[#86868B]">
                    Có {selectedDateTasks.length} công việc được ghi nhận
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleOpenAddModal(selectedDateStr)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-[#0071E3] hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm việc ngày này
              </button>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 mb-2.5" />
                <p className="text-sm font-semibold text-[#1D1D1F]">
                  Không có lịch công việc nào vào ngày này
                </p>
                <p className="text-xs text-[#86868B] mt-0.5 max-w-sm mx-auto">
                  Bạn có thể tạo lịch thi công, hẹn khảo sát hoặc ghi chú nhắc việc bảo hành.
                </p>
                <button
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  className="mt-3.5 px-4 py-2 bg-[#F5F5F7] hover:bg-slate-200/80 text-[#1D1D1F] rounded-2xl text-xs font-semibold transition-colors"
                >
                  + Lên lịch công việc mới
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {selectedDateTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleTaskStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteTask}
                    onNavigateToOrder={onNavigateToOrder}
                    onNavigateToCustomer={onNavigateToCustomer}
                    onCopyForZalo={handleCopyTaskForZalo}
                    isCopied={copiedTaskId === task.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: AGENDA / LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#86868B] font-medium px-1">
            <span>Tìm thấy <strong className="text-[#1D1D1F] font-semibold">{filteredTasks.length}</strong> công việc phù hợp</span>
            <span>Sắp xếp theo ngày & mức độ ưu tiên</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-[#1D1D1F] mb-1">
                Không tìm thấy công việc phù hợp
              </h3>
              <p className="text-xs text-[#86868B] max-w-md mx-auto">
                Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới công việc điều hành cho đội ngũ kỹ thuật.
              </p>
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-4 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-semibold shadow-xs transition-all"
              >
                + Thêm việc mới ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={onToggleTaskStatus}
                  onEdit={handleOpenEditModal}
                  onDelete={onDeleteTask}
                  onNavigateToOrder={onNavigateToOrder}
                  onNavigateToCustomer={onNavigateToCustomer}
                  onCopyForZalo={handleCopyTaskForZalo}
                  isCopied={copiedTaskId === task.id}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTasks.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="công việc"
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* VIEW MODE 3: KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Chờ thực hiện */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col min-h-[550px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-[#1D1D1F]">Chờ Thực Hiện</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60">
                  {filteredTasks.filter((t) => t.status === 'pending').length}
                </span>
                <button
                  onClick={() => handleOpenAddModal(undefined, 'installation')}
                  className="p-1 hover:bg-[#F5F5F7] rounded-lg text-[#86868B] hover:text-[#0071E3]"
                  title="Thêm việc chờ làm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {filteredTasks
                .filter((t) => t.status === 'pending')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleTaskStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteTask}
                    onNavigateToOrder={onNavigateToOrder}
                    onNavigateToCustomer={onNavigateToCustomer}
                    onCopyForZalo={handleCopyTaskForZalo}
                    isCopied={copiedTaskId === task.id}
                    compact
                    kanbanAction={
                      <button
                        onClick={() => onToggleTaskStatus(task.id, 'in_progress')}
                        className="w-full mt-2 py-1.5 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-[#0071E3] rounded-xl border border-blue-200/60 flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Bắt đầu thi công</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    }
                  />
                ))}
            </div>
          </div>

          {/* Column 2: Đang xử lý */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col min-h-[550px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-sm font-bold text-[#1D1D1F]">Đang Thi Công / Xử Lý</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0071E3] border border-blue-200/60">
                {filteredTasks.filter((t) => t.status === 'in_progress').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {filteredTasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleTaskStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteTask}
                    onNavigateToOrder={onNavigateToOrder}
                    onNavigateToCustomer={onNavigateToCustomer}
                    onCopyForZalo={handleCopyTaskForZalo}
                    isCopied={copiedTaskId === task.id}
                    compact
                    kanbanAction={
                      <button
                        onClick={() => onToggleTaskStatus(task.id, 'completed')}
                        className="w-full mt-2 py-1.5 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200/60 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Nghiệm thu hoàn tất</span>
                      </button>
                    }
                  />
                ))}
            </div>
          </div>

          {/* Column 3: Đã hoàn thành */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col min-h-[550px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-[#1D1D1F]">Đã Nghiệm Thu</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {filteredTasks.filter((t) => t.status === 'completed').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {filteredTasks
                .filter((t) => t.status === 'completed')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleTaskStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteTask}
                    onNavigateToOrder={onNavigateToOrder}
                    onNavigateToCustomer={onNavigateToCustomer}
                    onCopyForZalo={handleCopyTaskForZalo}
                    isCopied={copiedTaskId === task.id}
                    compact
                    kanbanAction={
                      <button
                        onClick={() => onToggleTaskStatus(task.id, 'pending')}
                        className="w-full mt-2 py-1.5 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-[#86868B] rounded-xl border border-slate-200/60 flex items-center justify-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Mở lại công việc</span>
                      </button>
                    }
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#F5F5F7]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    {editingTask ? 'Cập Nhật Công Việc' : 'Thêm Công Việc Mới'}
                  </h3>
                  <p className="text-xs text-[#86868B]">
                    Lên lịch thi công, khảo sát, bảo hành hoặc nhắc việc nội bộ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Task Title & Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Tiêu đề công việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Lắp đặt 4 camera Dahua cho Anh Minh..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-[#F5F5F7] border border-slate-200 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
                  <span className="text-[10px] text-[#86868B] font-semibold shrink-0">Gợi ý:</span>
                  {QUICK_TITLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormTitle(preset)}
                      className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-100 text-[#1D1D1F] hover:bg-blue-50 hover:text-[#0071E3] transition-colors whitespace-nowrap shrink-0 border border-slate-200/60"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time with Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#1D1D1F]">
                    Thời gian thực hiện <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(0)}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-blue-50 text-[#0071E3] font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Hôm nay
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(1)}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 text-[#1D1D1F] font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Ngày mai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(2)}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 text-[#1D1D1F] font-semibold hover:bg-slate-200 transition-colors"
                    >
                      2 ngày nữa
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
                  />
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
                  />
                </div>
              </div>

              {/* Task Type & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Phân loại việc
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AdminTask['type'])}
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
                  >
                    <option value="installation">📷 Lắp đặt / Thi công</option>
                    <option value="warranty">🛠️ Bảo hành / Bảo trì</option>
                    <option value="survey">📐 Khảo sát & Báo giá</option>
                    <option value="payment">💰 Thu hồi công nợ</option>
                    <option value="custom">📌 Việc nội bộ / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as AdminTask['priority'])}
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
                  >
                    <option value="normal">⚪ Bình thường</option>
                    <option value="high">⚡ Ưu tiên cao</option>
                    <option value="urgent">🔥 Khẩn cấp / Gấp</option>
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Người phụ trách
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAssignee('admin')}
                    className={cn(
                      'p-2 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                      formAssignee === 'admin'
                        ? 'border-[#0071E3] bg-blue-50 text-[#0071E3]'
                        : 'border-slate-200 bg-[#F5F5F7] text-[#1D1D1F] hover:bg-slate-200/60'
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Lập
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAssignee('admin1')}
                    className={cn(
                      'p-2 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                      formAssignee === 'admin1'
                        ? 'border-[#0071E3] bg-blue-50 text-[#0071E3]'
                        : 'border-slate-200 bg-[#F5F5F7] text-[#1D1D1F] hover:bg-slate-200/60'
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Tước
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAssignee('all')}
                    className={cn(
                      'p-2 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                      formAssignee === 'all'
                        ? 'border-[#0071E3] bg-blue-50 text-[#0071E3]'
                        : 'border-slate-200 bg-[#F5F5F7] text-[#1D1D1F] hover:bg-slate-200/60'
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Cả 2
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3.5 bg-[#F5F5F7]/70 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block">
                  Thông Tin Khách Hàng & Địa Bàn (TP. Huế)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder="Tên khách hàng"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-[#1D1D1F] focus:outline-none"
                  />
                  <input
                    type="tel"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    placeholder="Số điện thoại"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-[#1D1D1F] focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={formCustomerAddress}
                  onChange={(e) => setFormCustomerAddress(e.target.value)}
                  placeholder="Địa chỉ cụ thể (Ví dụ: 124 Hùng Vương, P. Phú Nhuận, TP. Huế)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-[#1D1D1F] focus:outline-none"
                />
              </div>

              {/* Order Link (Optional) */}
              {orders.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Liên kết đơn hàng (Tùy chọn)
                  </label>
                  <select
                    value={formOrderId}
                    onChange={(e) => {
                      const selId = e.target.value
                      setFormOrderId(selId)
                      if (selId) {
                        const selOrder = orders.find((o) => o.id === selId)
                        if (selOrder) {
                          if (!formCustomerName) setFormCustomerName(selOrder.customer_name)
                          if (!formCustomerPhone) setFormCustomerPhone(selOrder.customer_phone)
                          if (!formCustomerAddress) setFormCustomerAddress(selOrder.customer_address)
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200 text-[#1D1D1F] focus:outline-none"
                  >
                    <option value="">-- Không liên kết đơn hàng --</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.order_code} - {o.customer_name} ({o.services?.join(', ') || 'Camera'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Ghi chú chi tiết / Yêu cầu kỹ thuật
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú dây, nguồn, mật khẩu, vị trí lắp đặt..."
                  className="w-full px-3 py-2 text-xs rounded-2xl bg-[#F5F5F7] border border-slate-200 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-[#86868B] hover:bg-[#F5F5F7] transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs transition-all"
                >
                  {editingTask ? 'Lưu Cập Nhật' : 'Tạo Công Việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// REUSABLE APPLE TASK CARD COMPONENT
// -------------------------------------------------------------

interface TaskCardProps {
  task: AdminTask
  onToggleStatus: (taskId: string, newStatus?: AdminTask['status']) => void
  onEdit: (task: AdminTask) => void
  onDelete: (taskId: string) => void
  onNavigateToOrder?: (orderId: string) => void
  onNavigateToCustomer?: (customerId: string) => void
  onCopyForZalo?: (task: AdminTask) => void
  isCopied?: boolean
  compact?: boolean
  kanbanAction?: React.ReactNode
}

function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onNavigateToOrder,
  onNavigateToCustomer,
  onCopyForZalo,
  isCopied = false,
  compact = false,
  kanbanAction,
}: TaskCardProps) {
  const typeCfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.custom
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.normal
  const isCompleted = task.status === 'completed'
  const isInProgress = task.status === 'in_progress'

  return (
    <div
      className={cn(
        'group bg-white rounded-3xl p-4 sm:p-4.5 border transition-all relative flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md',
        isCompleted
          ? 'border-slate-200/60 bg-slate-50/50 opacity-90'
          : isInProgress
          ? 'border-blue-300 ring-2 ring-blue-400/20'
          : 'border-slate-200/80 hover:border-slate-300'
      )}
    >
      <div>
        {/* Top Badges: Type, Priority, Time */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Type badge */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1',
                typeCfg.badgeBg,
                typeCfg.badgeText,
                typeCfg.badgeBorder
              )}
            >
              <span>{typeCfg.emoji}</span>
              <span>{typeCfg.label}</span>
            </span>

            {/* Priority badge */}
            {task.priority !== 'normal' && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1',
                  priorityCfg.badgeBg,
                  priorityCfg.badgeText,
                  priorityCfg.badgeBorder
                )}
              >
                {task.priority === 'urgent' && <Flame className="w-2.5 h-2.5" />}
                {priorityCfg.label}
              </span>
            )}
          </div>

          {/* Time & Date Badge */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded-lg">
            <Clock className="w-3 h-3 text-[#0071E3]" />
            <span>{task.time || 'Cả ngày'}</span>
            <span className="text-slate-300">•</span>
            <span>{task.date}</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <button
            onClick={() => onToggleStatus(task.id)}
            className={cn(
              'mt-0.5 p-1 rounded-xl border transition-all shrink-0 active:scale-95',
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                : 'border-slate-300 hover:border-[#0071E3] text-transparent hover:text-[#0071E3] bg-white'
            )}
            title={isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>

          <h4
            className={cn(
              'text-sm font-bold text-[#1D1D1F] leading-snug',
              isCompleted && 'line-through text-[#86868B]'
            )}
          >
            {task.title}
          </h4>
        </div>

        {/* Customer & Address Details */}
        {(task.customer_name || task.customer_address) && (
          <div className="space-y-1.5 mb-2.5 text-xs text-[#1D1D1F] bg-[#F5F5F7]/80 p-2.5 rounded-2xl border border-slate-200/60">
            {task.customer_name && (
              <div className="flex items-center justify-between font-semibold">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                  <span className="truncate">{task.customer_name}</span>
                </div>
                {task.customer_phone && (
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${task.customer_phone}`}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title={`Gọi ${task.customer_phone}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://zalo.me/${task.customer_phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg text-[#0071E3] hover:bg-blue-50 transition-colors"
                      title="Nhắn Zalo"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {task.customer_address && (
              <div className="flex items-start gap-1.5 text-[#86868B] text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#86868B] shrink-0 mt-0.5" />
                <span className="line-clamp-2">{task.customer_address}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <p className="text-xs text-[#86868B] line-clamp-2 mb-3 italic bg-slate-50 px-2 py-1 rounded-xl">
            &ldquo;{task.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Kanban step transition button */}
      {kanbanAction}

      {/* Footer Meta & Actions */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-2.5">
        {/* Assignee */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0071E3] font-bold flex items-center justify-center text-[10px]">
            {task.assigned_to === 'admin1' ? 'T' : 'L'}
          </span>
          <span className="truncate">{task.assigned_name || 'Quản trị viên (Lập)'}</span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          {/* Copy dispatch for Zalo */}
          {onCopyForZalo && (
            <button
              onClick={() => onCopyForZalo(task)}
              className={cn(
                'p-1.5 rounded-xl transition-colors',
                isCopied
                  ? 'bg-emerald-50 text-emerald-600 font-semibold'
                  : 'text-[#86868B] hover:text-[#0071E3] hover:bg-blue-50'
              )}
              title="Sao chép nội dung gửi Zalo thợ kỹ thuật"
            >
              {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {task.order_id && onNavigateToOrder && (
            <button
              onClick={() => onNavigateToOrder(task.order_id!)}
              className="p-1.5 rounded-xl text-[#86868B] hover:text-[#0071E3] hover:bg-blue-50 transition-colors"
              title="Xem chi tiết đơn hàng liên kết"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            title="Chỉnh sửa công việc"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                onDelete(task.id)
              }
            }}
            className="p-1.5 rounded-xl text-[#86868B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Xóa công việc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
