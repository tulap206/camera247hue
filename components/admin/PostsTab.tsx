'use client'

import React, { useState, useMemo } from 'react'
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  ExternalLink,
  Settings,
  Image as ImageIcon,
  Calendar,
  MapPin,
  X,
  Sparkles,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Copy,
  Check,
  Tag,
  Building2,
  FolderPlus,
  Layers,
  Globe,
  Share2,
  RotateCcw,
  ArrowUpDown,
  RefreshCw,
  Clock,
  Folder,
  Upload,
  ChevronDown
} from 'lucide-react'
import type { Post, Category } from '@/lib/supabase'
import { POST_TEMPLATES, HUE_WARDS } from '@/lib/camera247-data'
import { cn } from '@/lib/utils'
import PaginationControl from './PaginationControl'

interface PostsTabProps {
  posts: Post[]
  categories: Category[]
  onRefresh: () => void
  onDeletePost: (id: string) => void
  onTogglePublish: (post: Post) => void
  onSavePost: (postData: any) => Promise<boolean>
  onAddCategory: (name: string) => Promise<Category | null>
  onUpdateCategory: (id: string, name: string) => Promise<boolean>
  onDeleteCategory: (id: string) => Promise<boolean>
}

// Convert HTML to text for editing
function htmlToText(html: string): string {
  if (!html) return ''
  if (!html.includes('<') && !html.includes('>')) return html

  return html
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<p>/gi, '')
    .replace(/<ul>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<h[1-6]>/gi, '')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
}

// Convert text to HTML for saving
function textToHtml(text: string): string {
  if (!text) return ''

  let inList = false
  const lines = text.split('\n')
  const htmlLines = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inList) {
        inList = false
        return '</ul><br/>'
      }
      return '<br/>'
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      let prefix = ''
      if (!inList) {
        inList = true
        prefix = '<ul>'
      }
      return `${prefix}<li>${trimmed.substring(2)}</li>`
    } else {
      let prefix = ''
      if (inList) {
        inList = false
        prefix = '</ul>'
      }
      if (trimmed.startsWith('# ')) {
        return `${prefix}<h2>${trimmed.substring(2)}</h2>`
      }
      return `${prefix}<p>${trimmed}</p>`
    }
  })

  let result = htmlLines.join('')
  if (inList) {
    result += '</ul>'
  }
  return result
}

export function PostsTab({
  posts,
  categories,
  onRefresh,
  onDeletePost,
  onTogglePublish,
  onSavePost,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: PostsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden' | 'featured'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'featured_first' | 'title_az'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [editingPost, setEditingPost] = useState<Post | null | undefined>(undefined) // undefined = closed, null = create new
  const [showCatManager, setShowCatManager] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const ITEMS_PER_PAGE = viewMode === 'grid' ? 6 : 10

  // Post form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image: '',
    category_id: '',
    location: '',
    client_name: '',
    completed_at: '',
    featured: false,
    published: true,
    images: [] as string[],
  })
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [savingPost, setSavingPost] = useState(false)
  const [formError, setFormError] = useState('')

  // Category Manager State
  const [newCatName, setNewCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatName, setEditingCatName] = useState('')

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const openNewPostForm = () => {
    setForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      cover_image: '',
      category_id: categories[0]?.id || '',
      location: 'TP. Huế',
      client_name: '',
      completed_at: new Date().toISOString().split('T')[0],
      featured: false,
      published: true,
      images: [],
    })
    setFormError('')
    setIsPreviewMode(false)
    setEditingPost(null)
  }

  const openEditPostForm = (post: Post) => {
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      content: htmlToText(post.content || ''),
      excerpt: post.excerpt || '',
      cover_image: post.cover_image || '',
      category_id: post.category_id || '',
      location: post.location || '',
      client_name: post.client_name || '',
      completed_at: post.completed_at || '',
      featured: post.featured || false,
      published: post.published ?? true,
      images: post.images || [],
    })
    setFormError('')
    setIsPreviewMode(false)
    setEditingPost(post)
  }

  const handleApplyTemplate = (tpl: typeof POST_TEMPLATES[0]) => {
    const defaultTitle = `${tpl.title} - Công Trình Tại Huế`
    setForm((prev) => ({
      ...prev,
      title: defaultTitle,
      slug: generateSlug(defaultTitle),
      category_id: tpl.category_id,
      excerpt: tpl.excerpt,
      content: tpl.content,
    }))
  }

  const handleTitleChange = (title: string) => {
    setForm((p) => ({
      ...p,
      title,
      slug: editingPost === null ? generateSlug(title) : p.slug,
    }))
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm((p) => ({ ...p, cover_image: data.url }))
      } else {
        alert('Lỗi khi tải ảnh lên.')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploadingCover(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
        }
      }
      setForm((p) => ({ ...p, images: [...p.images, ...uploadedUrls] }))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleRemoveGalleryImage = (idx: number) => {
    setForm((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== idx),
    }))
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) {
      setFormError('Vui lòng nhập tiêu đề và slug URL.')
      return
    }

    setSavingPost(true)
    setFormError('')

    const ok = await onSavePost({
      ...form,
      content: textToHtml(form.content),
      id: editingPost?.id,
    })

    if (ok) {
      setEditingPost(undefined)
    } else {
      setFormError('Lỗi khi lưu bài viết.')
    }
    setSavingPost(false)
  }

  const handleToggleFeatured = async (post: Post, e?: React.MouseEvent) => {
    e?.stopPropagation()
    await onSavePost({
      id: post.id,
      featured: !post.featured,
    })
  }

  const handleCopyLink = (slug: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const url = `${window.location.origin}/cong-trinh/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-')
      return `${d}/${m}/${y}`
    }
    return dateStr
  }

  // Filter & sort posts
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return posts
      .filter((p) => {
        const matchSearch =
          !q ||
          p.title?.toLowerCase().includes(q) ||
          p.slug?.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.client_name && p.client_name.toLowerCase().includes(q))

        const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter

        let matchStatus = true
        if (statusFilter === 'published') matchStatus = p.published
        else if (statusFilter === 'hidden') matchStatus = !p.published
        else if (statusFilter === 'featured') matchStatus = p.featured

        return matchSearch && matchCat && matchStatus
      })
      .sort((a, b) => {
        if (sortBy === 'featured_first') {
          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1
          }
        }
        if (sortBy === 'title_az') {
          return (a.title || '').localeCompare(b.title || '', 'vi')
        }
        if (sortBy === 'oldest') {
          const dateA = new Date(a.created_at || a.completed_at || 0).getTime()
          const dateB = new Date(b.created_at || b.completed_at || 0).getTime()
          return dateA - dateB
        }
        // Default newest
        const dateA = new Date(a.created_at || a.completed_at || 0).getTime()
        const dateB = new Date(b.created_at || b.completed_at || 0).getTime()
        return dateB - dateA
      })
  }, [posts, searchQuery, categoryFilter, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE))
  const paginatedPosts = useMemo(() => {
    return filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredPosts, currentPage, ITEMS_PER_PAGE])

  const publishedCount = useMemo(() => posts.filter((p) => p.published).length, [posts])
  const featuredCount = useMemo(() => posts.filter((p) => p.featured).length, [posts])
  const hiddenCount = useMemo(() => posts.length - publishedCount, [posts, publishedCount])

  // Word count & read time estimator
  const wordCount = useMemo(() => {
    return form.content.trim().split(/\s+/).filter(Boolean).length
  }, [form.content])
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180))

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner - Apple Light Style */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                Bài Viết & Dự Án Công Trình
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0071E3] border border-blue-200/60">
                {posts.length} bài viết
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
              Đăng tải tư liệu hình ảnh thực tế, quản trị danh mục và khẳng định năng lực thi công tại TP. Huế
            </p>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
            title="Tải lại danh sách"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Làm Mới</span>
          </button>

          <button
            onClick={() => setShowCatManager(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm border border-slate-200 transition-all shadow-2xs active:scale-[0.98]"
          >
            <Folder className="w-4 h-4 text-slate-600" />
            <span>Danh mục ({categories.length})</span>
          </button>

          <button
            onClick={openNewPostForm}
            className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Bài Mới</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards - 2x2 Mobile, 4-col Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Công Trình</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {posts.length}
            </span>
            <span className="text-xs text-slate-500">tư liệu</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang Xuất Bản</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
              {publishedCount}
            </span>
            <span className="text-xs text-slate-500">bài live</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công Trình Tiêu Biểu</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">
              {featuredCount}
            </span>
            <span className="text-xs text-slate-500">nổi bật ⭐</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh Mục Giải Pháp</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-purple-700 font-mono tabular-nums">
              {categories.length}
            </span>
            <span className="text-xs text-slate-500">chủ đề</span>
          </div>
        </div>
      </div>

      {/* Multi-layer Search & View Toggle Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        {/* Row 1: Status Filter Tabs & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar gap-1 max-w-full">
            {[
              { id: 'all', label: 'Tất cả', count: posts.length },
              { id: 'published', label: 'Đã xuất bản', count: publishedCount },
              { id: 'hidden', label: 'Bản nháp / Ẩn', count: hiddenCount },
              { id: 'featured', label: 'Tiêu biểu ⭐', count: featuredCount },
            ].map((tab) => {
              const active = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as any)
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

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 gap-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all',
                  viewMode === 'table' ? 'bg-white text-[#1D1D1F] shadow-2xs' : 'text-[#86868B] hover:text-[#1D1D1F]'
                )}
                title="Xem dạng bảng danh sách"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Bảng</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all',
                  viewMode === 'grid' ? 'bg-white text-[#1D1D1F] shadow-2xs' : 'text-[#86868B] hover:text-[#1D1D1F]'
                )}
                title="Xem dạng lưới thẻ"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Lưới</span>
              </button>
            </div>

            {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setStatusFilter('all')
                  setSortBy('newest')
                  setCurrentPage(1)
                }}
                className="inline-flex items-center gap-1 text-xs text-[#0071E3] hover:underline font-medium px-2 py-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Search Input + Category Filter + Sort Select */}
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
              placeholder="Tìm theo tiêu đề, slug, khách hàng, địa điểm..."
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

          {/* Category Filter */}
          <div className="relative sm:col-span-3 lg:col-span-3">
            <Folder className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-7 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer truncate font-medium"
            >
              <option value="all">Tất cả danh mục ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
              <option value="newest">Mới đăng gần đây</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="featured_first">Công trình tiêu biểu ⭐</option>
              <option value="title_az">Tiêu đề theo thứ tự A - Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Posts Display: Grid or Table */}
      {viewMode === 'grid' ? (
        /* GRID VIEW (CARDS) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPosts.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-2 shadow-2xs">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">Không tìm thấy bài viết phù hợp</p>
                <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc tạo bài viết công trình mới.</p>
              </div>
            ) : (
              paginatedPosts.map((post) => {
                const cat = categories.find((c) => c.id === post.category_id)
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col group"
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                          <span className="text-[11px] mt-1 text-slate-400 font-medium">Chưa có ảnh bìa</span>
                        </div>
                      )}

                      {/* Category Badge & Featured Star */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white font-medium text-[11px] shadow-xs">
                          {cat?.name || 'Công trình'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleToggleFeatured(post, e)}
                          className={cn(
                            'p-1.5 rounded-xl backdrop-blur-md transition-transform hover:scale-110 pointer-events-auto shadow-xs',
                            post.featured
                              ? 'bg-amber-500 text-white'
                              : 'bg-black/40 text-white/80 hover:bg-black/60'
                          )}
                          title={post.featured ? 'Đã ghim nổi bật' : 'Ghim nổi bật'}
                        >
                          <Star className={cn('w-3.5 h-3.5', post.featured && 'fill-white')} />
                        </button>
                      </div>

                      {/* Live / Hidden indicator */}
                      <div className="absolute bottom-3 left-3">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold backdrop-blur-md flex items-center gap-1 shadow-xs',
                            post.published
                              ? 'bg-emerald-600/90 text-white'
                              : 'bg-slate-700/90 text-slate-200'
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', post.published ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400')} />
                          {post.published ? 'Đang phát sóng' : 'Bản nháp / Ẩn'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0071E3] transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#0071E3]" />
                            <span className="truncate max-w-[140px]">{post.location || 'TP. Huế'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatDisplayDate(post.completed_at || post.created_at)}</span>
                          </span>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`/cong-trinh/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-blue-50 text-[#0071E3] hover:bg-blue-100 transition-colors"
                              title="Xem trực tiếp trên website"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={(e) => handleCopyLink(post.slug, e)}
                              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                              title="Sao chép liên kết bài viết"
                            >
                              {copiedSlug === post.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditPostForm(post)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-semibold text-xs transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => setPostToDelete(post)}
                              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa bài viết"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPosts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="bài viết"
            onPageChange={(page) => setCurrentPage(page)}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs"
          />
        </div>
      ) : (
        /* TABLE VIEW (LIST) */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">STT</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Bài Viết / Dự Án Thi Công</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Danh Mục</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Khách Hàng & Địa Điểm</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Ngày Thi Công</th>
                  <th className="py-3.5 px-4 text-center min-w-[120px]">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap w-28">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-[#1D1D1F]">
                {paginatedPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center space-y-2">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">Không tìm thấy bài viết phù hợp</p>
                      <p className="text-xs text-[#86868B]">Thử thay đổi từ khóa tìm kiếm hoặc bấm Viết bài mới.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedPosts.map((post, idx) => {
                    const cat = categories.find((c) => c.id === post.category_id)
                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => openEditPostForm(post)}
                      >
                        {/* Index */}
                        <td className="py-4 px-4 text-center font-mono text-[#86868B] text-[11px]">
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>

                        {/* Thumbnail & Title */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 mt-0.5">
                              {post.cover_image ? (
                                <img
                                  src={post.cover_image}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <ImageIcon className="w-4 h-4 opacity-40" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#0071E3] transition-colors line-clamp-1">
                                  {post.title}
                                </h4>
                                {post.featured && (
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
                                /{post.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-blue-50 text-[#0071E3] border border-blue-200/60 text-[11px] font-semibold">
                            {cat?.name || 'Chung'}
                          </span>
                        </td>

                        {/* Location & Client */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5 text-[11.5px]">
                            <p className="font-medium text-slate-800">{post.client_name || 'Khách hàng TP. Huế'}</p>
                            <p className="text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#0071E3]" />
                              {post.location || 'TP. Huế'}
                            </p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4">
                          <span className="font-mono text-slate-600 text-[11px]">
                            {formatDisplayDate(post.completed_at || post.created_at)}
                          </span>
                        </td>

                        {/* Published toggle */}
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onTogglePublish(post)}
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all border shadow-2xs',
                              post.published
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            )}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full', post.published ? 'bg-emerald-500' : 'bg-slate-400')} />
                            <span>{post.published ? 'Hiển thị' : 'Ẩn'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <a
                              href={`/cong-trinh/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-blue-50 text-[#0071E3] hover:bg-blue-100 transition-colors"
                              title="Xem trên web"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => handleCopyLink(post.slug, e)}
                              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                              title="Sao chép link"
                            >
                              {copiedSlug === post.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditPostForm(post)}
                              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPostToDelete(post)}
                              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa"
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

          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPosts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="bài viết"
            onPageChange={(page) => setCurrentPage(page)}
            className="rounded-t-none border-x-0 border-b-0 border-t bg-slate-50/50"
          />
        </div>
      )}

      {/* MODAL: CREATE / EDIT POST (APPLE SHEET STYLE) */}
      {editingPost !== undefined && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingPost ? 'Chỉnh Sửa Bài Viết Công Trình' : 'Soạn Thảo Bài Viết Công Trình Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tư liệu thực tế khẳng định uy tín thi công Camera 247 Huế
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs',
                    isPreviewMode
                      ? 'bg-[#0071E3] text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  )}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isPreviewMode ? 'Chế độ soạn thảo' : 'Xem trước'}</span>
                </button>

                <button
                  onClick={() => setEditingPost(undefined)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {isPreviewMode ? (
              /* LIVE PREVIEW */
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1 bg-white text-slate-900">
                <div className="max-w-2xl mx-auto space-y-4">
                  {form.cover_image && (
                    <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-md">
                      <img src={form.cover_image} alt={form.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    {form.title || 'Tiêu đề bài viết...'}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>📍 {form.location || 'TP. Huế'}</span>
                    <span>•</span>
                    <span>Khách hàng: <strong>{form.client_name || 'Đang cập nhật'}</strong></span>
                    <span>•</span>
                    <span>Thời gian đọc: ~{readTimeMinutes} phút</span>
                  </div>
                  {form.excerpt && (
                    <p className="text-sm text-slate-600 font-medium italic bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      {form.excerpt}
                    </p>
                  )}
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {form.content || 'Nội dung chi tiết giải pháp thi công...'}
                  </div>
                </div>
              </div>
            ) : (
              /* FORM EDITOR */
              <form onSubmit={handlePostSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
                    {formError}
                  </div>
                )}

                {/* Quick Templates Drawer */}
                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-2">
                  <span className="text-xs font-bold text-[#0071E3] flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Mẫu Bài Viết Soạn Sẵn Chuẩn Kỹ Thuật (Điền nhanh)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POST_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-100 text-slate-700 hover:text-[#0071E3] border border-blue-200 text-[11px] font-medium transition-colors shadow-2xs"
                      >
                        + {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Tiêu đề bài viết công trình <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Ví dụ: Lắp Đặt Hệ Thống 32 Camera Tại Khách Sạn Hương Giang Huế..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-semibold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Đường dẫn tĩnh (Slug URL) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="lap-dat-32-camera-khach-san-huong-giang-hue"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Category, Client, Location & Completion Date */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Danh mục giải pháp
                    </label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] font-medium transition-all"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Tên khách hàng / Đơn vị
                    </label>
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      placeholder="Khách Sạn Hương Giang..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Địa điểm thi công
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="51 Lê Lợi, TP. Huế..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Ngày hoàn thành
                    </label>
                    <input
                      type="date"
                      value={form.completed_at}
                      onChange={(e) => setForm({ ...form, completed_at: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Mô tả tóm tắt (SEO & Hiển thị thẻ bài viết)
                  </label>
                  <textarea
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Tóm tắt ngắn gọn quy mô công trình, giải pháp triển khai và kết quả đạt được..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 resize-none transition-all"
                  />
                </div>

                {/* Cover Image & Gallery Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  {/* Cover Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Ảnh bìa bài viết (Cover Image)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {form.cover_image ? (
                          <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-[#0071E3]" />
                          <span>{uploadingCover ? 'Đang tải...' : 'Chọn ảnh bìa'}</span>
                          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        </label>
                        <input
                          type="text"
                          value={form.cover_image}
                          onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                          placeholder="Hoặc dán URL ảnh /images/..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gallery Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Thư viện ảnh thi công ({form.images.length})
                      </label>
                      <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071E3] hover:underline cursor-pointer">
                        <Plus className="w-3 h-3" />
                        <span>Thêm ảnh gallery</span>
                        <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                      {form.images.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">Chưa có ảnh trong gallery</p>
                      ) : (
                        form.images.map((img, idx) => (
                          <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 group">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Nội dung chi tiết giải pháp thi công *
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {wordCount} từ · ~{readTimeMinutes} phút đọc
                    </span>
                  </div>
                  <textarea
                    rows={10}
                    required
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="# Giới Thiệu Dự Án&#10;Quy mô công trình và yêu cầu an ninh...&#10;&#10;# Giải Pháp Kỹ Thuật&#10;- Lắp đặt camera AI ColorVu...&#10;- Hệ thống đầu ghi và cáp mạng...&#10;&#10;# Nghiệm Thu Bàn Giao&#10;Khách hàng hài lòng..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 font-sans leading-relaxed transition-all"
                  />
                </div>

                {/* Visibility & Featured Toggles */}
                <div className="flex items-center gap-6 pt-2 border-t border-slate-100 flex-wrap">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0071E3] focus:ring-[#0071E3]"
                    />
                    <span>Xuất bản ngay (Hiển thị công khai trên website)</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      Ghim vào danh sách Công trình tiêu biểu
                    </span>
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingPost(undefined)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingPost}
                    className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs rounded-2xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {savingPost ? 'Đang lưu...' : editingPost ? 'Lưu Thay Đổi Bài Viết' : 'Xuất Bản Bài Viết Mới'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY MANAGER */}
      {showCatManager && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <Folder className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Quản Lý Danh Mục Giải Pháp
                  </h3>
                  <p className="text-xs text-slate-500">Phân loại các bài viết công trình theo chủ đề</p>
                </div>
              </div>
              <button
                onClick={() => setShowCatManager(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Add New Category Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!newCatName.trim()) return
                  await onAddCategory(newCatName.trim())
                  setNewCatName('')
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Tên danh mục mới (Ví dụ: Hệ Thống Báo Động...)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071E3] transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
                >
                  + Thêm Mới
                </button>
              </form>

              {/* Category List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                {categories.map((c) => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-white transition-colors">
                    {editingCatId === c.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!editingCatName.trim()) return
                            await onUpdateCategory(c.id, editingCatName.trim())
                            setEditingCatId(null)
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-slate-900">{c.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{c.slug}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(c.id)
                              setEditingCatName(c.name)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                            title="Sửa tên"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Xác nhận xóa danh mục "${c.name}"?`)) {
                                await onDeleteCategory(c.id)
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCatManager(false)}
                className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl text-xs font-semibold shadow-xs transition-all"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE POST CONFIRMATION MODAL */}
      {postToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa bài viết công trình?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn sắp xóa bài viết <strong>{postToDelete.title}</strong>. Thao tác này sẽ gỡ bỏ bài viết vĩnh viễn khỏi website và kho tư liệu.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePost(postToDelete.id)
                  setPostToDelete(null)
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
