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
  FolderOpen
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
type StatusFilter = 'all' | 'today' | 'pending' | 'in_progress' | 'completed' | 'overdue'

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

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
  const handleOpenAddModal = (defaultDate?: string) => {
    setEditingTask(null)
    setFormTitle('')
    setFormDate(defaultDate || selectedDateStr || todayStr)
    setFormTime('08:30')
    setFormType('installation')
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

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
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
  }, [tasks, statusFilter, typeFilter, assigneeFilter, priorityFilter, searchQuery, todayStr])

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

    return {
      monthLabel: `Tháng ${month + 1}, ${year}`,
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

  return (
    <div className="space-y-6">
      {/* Header Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CalendarCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Nhắc Việc & Lịch Điều Hành
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lịch trình thi công, bảo hành, khảo sát và công việc toàn hệ thống Camera247 Huế
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-inner">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch tháng</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm việc mới</span>
          </button>
        </div>
      </div>

      {/* 4 Apple KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Hôm nay cần làm */}
        <div
          onClick={() => {
            setStatusFilter('today')
            setViewMode('agenda')
          }}
          className="cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Hôm nay cần làm
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {kpis.todayCount}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">công việc</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            Ưu tiên xử lý trong ngày hôm nay
          </p>
        </div>

        {/* KPI 2: Chờ thi công & lắp đặt */}
        <div
          onClick={() => {
            setTypeFilter('installation')
            setStatusFilter('pending')
            setViewMode('agenda')
          }}
          className="cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Chờ lắp đặt & thi công
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {kpis.pendingInstallCount}
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">công trình</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            Đơn hàng cần xuất tuyến lắp đặt
          </p>
        </div>

        {/* KPI 3: Bảo hành & Bảo trì */}
        <div
          onClick={() => {
            setTypeFilter('warranty')
            setStatusFilter('all')
            setViewMode('agenda')
          }}
          className="cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Bảo hành & Bảo trì
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {kpis.warrantyCount}
            </span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">yêu cầu</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            Hỗ trợ khách hàng tận nơi 24/7
          </p>
        </div>

        {/* KPI 4: Đã hoàn thành */}
        <div
          onClick={() => {
            setStatusFilter('completed')
            setViewMode('agenda')
          }}
          className="cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all hover:border-emerald-300 dark:hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Đã hoàn thành
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {kpis.completedCount}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">đã xong</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            Công việc đã hoàn tất nghiệm thu
          </p>
        </div>
      </div>

      {/* 2-Tier Smart Filter Bar */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700/60 shadow-sm space-y-3">
        {/* Tier 1: Segmented Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-gray-400 font-semibold px-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Lọc nhanh:
          </span>
          {[
            { id: 'all' as StatusFilter, label: 'Tất cả việc', count: tasks.length },
            { id: 'today' as StatusFilter, label: 'Hôm nay', count: tasks.filter((t) => t.date === todayStr).length },
            { id: 'pending' as StatusFilter, label: 'Chờ xử lý', count: tasks.filter((t) => t.status === 'pending').length },
            { id: 'in_progress' as StatusFilter, label: 'Đang làm', count: tasks.filter((t) => t.status === 'in_progress').length },
            { id: 'overdue' as StatusFilter, label: 'Quá hạn', count: tasks.filter((t) => t.date < todayStr && t.status !== 'completed').length },
            { id: 'completed' as StatusFilter, label: 'Đã xong', count: tasks.filter((t) => t.status === 'completed').length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={cn(
                'px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
                statusFilter === item.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <span>{item.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  statusFilter === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                )}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tier 2: Search, Task Type, Assignee, Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm việc, khách hàng, số ĐT..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Select */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Tất cả mức ưu tiên</option>
              <option value="urgent">🔥 Khẩn cấp</option>
              <option value="high">⚡ Cao</option>
              <option value="normal">⚪ Bình thường</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE APPLE CALENDAR MONTH GRID */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm overflow-hidden">
            {/* Calendar Header Navigation */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {calendarGrid.monthLabel}
                </h2>
                <button
                  onClick={handleTodayMonth}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Hôm nay
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Tháng trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Tháng sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/30 text-center">
              {DAYS_OF_WEEK.map((d, index) => (
                <div
                  key={d}
                  className={cn(
                    'py-2.5 text-xs font-semibold uppercase tracking-wider',
                    index >= 5 ? 'text-rose-500 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Month Matrix Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-gray-700/50 bg-gray-100 dark:bg-gray-900/30">
              {calendarGrid.gridDays.map((cell) => {
                const isSelected = cell.dateStr === selectedDateStr
                const hasTasks = cell.tasks.length > 0
                const pendingCount = cell.tasks.filter((t) => t.status !== 'completed').length

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={cn(
                      'min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2.5 transition-all cursor-pointer relative group flex flex-col justify-between',
                      cell.isCurrentMonth
                        ? 'bg-white dark:bg-gray-800/90'
                        : 'bg-gray-50/50 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600',
                      isSelected && 'ring-2 ring-inset ring-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                    )}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold',
                          cell.isToday
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold'
                            : cell.isCurrentMonth
                            ? 'text-gray-700 dark:text-gray-200'
                            : 'text-gray-400 dark:text-gray-600'
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
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
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
                              'text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 border',
                              isDone
                                ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 line-through border-transparent'
                                : `${typeCfg.badgeBg} ${typeCfg.badgeText} ${typeCfg.badgeBorder}`
                            )}
                          >
                            <span>{typeCfg.emoji}</span>
                            <span className="truncate">{t.title}</span>
                          </div>
                        )
                      })}

                      {cell.tasks.length > 2 && (
                        <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-1">
                          +{cell.tasks.length - 2} việc khác
                        </div>
                      )}
                    </div>

                    {/* Dot status summary */}
                    {hasTasks && cell.tasks.length <= 2 && (
                      <div className="flex items-center gap-1 mt-1">
                        {pendingCount > 0 ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        )}
                        <span className="text-[9px] text-gray-400 font-medium">
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
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Lịch trình ngày: {selectedDateStr}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {selectedDateTasks.length} việc
                </span>
              </div>
              <button
                onClick={() => handleOpenAddModal(selectedDateStr)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm việc ngày này
              </button>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarCheck className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Không có lịch công việc nào vào ngày này.
                </p>
                <button
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  className="mt-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  + Lên lịch công việc mới
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDateTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleTaskStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteTask}
                    onNavigateToOrder={onNavigateToOrder}
                    onNavigateToCustomer={onNavigateToCustomer}
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
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
            <span>Tìm thấy {filteredTasks.length} công việc theo bộ lọc</span>
            <span>Sắp xếp theo ngày & giờ thực hiện</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-12 border border-gray-200/80 dark:border-gray-700/60 text-center shadow-sm">
              <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Không tìm thấy công việc phù hợp
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới công việc điều hành cho đội ngũ kỹ thuật.
              </p>
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                + Thêm việc mới ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={onToggleTaskStatus}
                  onEdit={handleOpenEditModal}
                  onDelete={onDeleteTask}
                  onNavigateToOrder={onNavigateToOrder}
                  onNavigateToCustomer={onNavigateToCustomer}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Chờ thực hiện */}
          <div className="bg-gray-50/80 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-800/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Chờ Thực Hiện</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {filteredTasks.filter((t) => t.status === 'pending').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
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
                    compact
                  />
                ))}
            </div>
          </div>

          {/* Column 2: Đang xử lý */}
          <div className="bg-gray-50/80 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-800/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Đang Xử Lý</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {filteredTasks.filter((t) => t.status === 'in_progress').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
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
                    compact
                  />
                ))}
            </div>
          </div>

          {/* Column 3: Đã hoàn thành */}
          <div className="bg-gray-50/80 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-800/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Đã Hoàn Thành</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {filteredTasks.filter((t) => t.status === 'completed').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
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
                    compact
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CalendarCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingTask ? 'Cập Nhật Công Việc' : 'Thêm Công Việc Mới'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lên lịch thi công, khảo sát, bảo hành hoặc nhắc việc nội bộ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tiêu đề công việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Lắp đặt 4 camera Dahua cho Anh Minh..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Ngày thực hiện <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Giờ hẹn / Xuất tuyến
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Task Type & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phân loại việc
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AdminTask['type'])}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="installation">📷 Lắp đặt / Thi công</option>
                    <option value="warranty">🛠️ Bảo hành / Bảo trì</option>
                    <option value="survey">📐 Khảo sát & Tư vấn</option>
                    <option value="payment">💰 Thu hồi công nợ</option>
                    <option value="custom">📌 Việc nội bộ / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as AdminTask['priority'])}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="normal">⚪ Bình thường</option>
                    <option value="high">⚡ Ưu tiên cao</option>
                    <option value="urgent">🔥 Khẩn cấp / Gấp</option>
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Người phụ trách
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAssignee('admin')}
                    className={cn(
                      'p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                      formAssignee === 'admin'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Lập
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAssignee('admin1')}
                    className={cn(
                      'p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                      formAssignee === 'admin1'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Tước
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAssignee('all')}
                    className={cn(
                      'p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                      formAssignee === 'all'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Cả 2
                  </button>
                </div>
              </div>

              {/* Customer Info (Optional) */}
              <div className="p-3 bg-gray-50/70 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-2.5">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Thông tin khách hàng & Địa bàn (TP. Huế)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder="Tên khách hàng"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="tel"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    placeholder="Số điện thoại"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  value={formCustomerAddress}
                  onChange={(e) => setFormCustomerAddress(e.target.value)}
                  placeholder="Địa chỉ cụ thể (Ví dụ: 124 Hùng Vương, P. Phú Nhuận, TP. Huế)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Order Link (Optional) */}
              {orders.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none"
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú chi tiết / Yêu cầu kỹ thuật
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú dây, nguồn, mật khẩu, vị trí lắp đặt..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  {editingTask ? 'Lưu cập nhật' : 'Tạo công việc'}
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
  compact?: boolean
}

function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onNavigateToOrder,
  onNavigateToCustomer,
  compact = false,
}: TaskCardProps) {
  const typeCfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.custom
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.normal
  const isCompleted = task.status === 'completed'
  const isInProgress = task.status === 'in_progress'

  return (
    <div
      className={cn(
        'group bg-white dark:bg-gray-800/90 rounded-2xl p-4 border transition-all relative flex flex-col justify-between shadow-sm hover:shadow-md',
        isCompleted
          ? 'border-gray-200 dark:border-gray-700/60 opacity-85 bg-gray-50/50 dark:bg-gray-800/40'
          : isInProgress
          ? 'border-blue-300 dark:border-blue-500/40 ring-1 ring-blue-500/10'
          : 'border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <div>
        {/* Top Badges: Type, Priority, Time */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Type badge */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-md text-[11px] font-semibold border flex items-center gap-1',
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
                  'px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1',
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
          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" />
            <span>{task.time || 'Cả ngày'}</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span>{task.date}</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={() => onToggleStatus(task.id)}
            className={cn(
              'mt-0.5 p-1 rounded-lg border transition-all shrink-0',
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 text-transparent hover:text-blue-500'
            )}
            title={isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>

          <h4
            className={cn(
              'text-sm font-bold text-gray-900 dark:text-white leading-snug',
              isCompleted && 'line-through text-gray-400 dark:text-gray-500'
            )}
          >
            {task.title}
          </h4>
        </div>

        {/* Customer & Address Details */}
        {(task.customer_name || task.customer_address) && (
          <div className="space-y-1 mb-2.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
            {task.customer_name && (
              <div className="flex items-center justify-between font-semibold">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{task.customer_name}</span>
                </div>
                {task.customer_phone && (
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${task.customer_phone}`}
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      title={`Gọi ${task.customer_phone}`}
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                    <a
                      href={`https://zalo.me/${task.customer_phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Nhắn Zalo"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {task.customer_address && (
              <div className="flex items-start gap-1.5 text-gray-500 dark:text-gray-400 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{task.customer_address}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 italic">
            &ldquo;{task.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2 mt-auto">
        {/* Assignee */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
            {task.assigned_to === 'admin1' ? 'T' : 'L'}
          </span>
          <span className="truncate">{task.assigned_name || 'Quản trị viên (Lập)'}</span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          {task.order_id && onNavigateToOrder && (
            <button
              onClick={() => onNavigateToOrder(task.order_id!)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              title="Xem chi tiết đơn hàng liên kết"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Xóa công việc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
