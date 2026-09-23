'use client'

import { useState, useMemo } from 'react'
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
  Download,
  Copy,
  Check,
  Tag,
  Building2,
  FolderPlus,
  Layers,
  Globe,
  Share2,
} from 'lucide-react'
import type { Post, Category } from '@/lib/supabase'
import { POST_TEMPLATES } from '@/lib/camera247-data'
import { cn } from '@/lib/utils'

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [editingPost, setEditingPost] = useState<Post | null | undefined>(undefined) // undefined = closed, null = create new
  const [showCatManager, setShowCatManager] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const ITEMS_PER_PAGE = viewMode === 'grid' ? 6 : 8

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
    setEditingPost(post)
  }

  const handleApplyTemplate = (tpl: typeof POST_TEMPLATES[0]) => {
    const defaultTitle = `${tpl.title} - Công Trình Mới Tại Huế`
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

  const handleToggleFeatured = async (post: Post) => {
    await onSavePost({
      id: post.id,
      featured: !post.featured,
    })
  }

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/cong-trinh/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  // Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (posts.length === 0) {
      alert('Chưa có bài viết nào để xuất!')
      return
    }

    const headers = [
      'ID',
      'Tiêu Đề Bài Viết',
      'Slug URL',
      'Danh Mục',
      'Địa Điểm',
      'Khách Hàng / Đơn Vị',
      'Ngày Hoàn Thành',
      'Nổi Bật',
      'Trạng Thái',
      'Số Lượng Ảnh Album',
    ]

    const rows = posts.map((p) => {
      const catName = categories.find((c) => c.id === p.category_id)?.name || p.category?.name || 'Chưa phân loại'
      return [
        `"${p.id}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${p.slug || ''}"`,
        `"${catName.replace(/"/g, '""')}"`,
        `"${(p.location || '').replace(/"/g, '""')}"`,
        `"${(p.client_name || '').replace(/"/g, '""')}"`,
        `"${p.completed_at || ''}"`,
        p.featured ? '"Nổi bật"' : '"Thường"',
        p.published ? '"Đã xuất bản"' : '"Đang ẩn"',
        p.images?.length || 0,
      ].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Camera247_DanhMuc_CongTrinh_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter posts
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return posts.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q))

      const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter

      let matchStatus = true
      if (statusFilter === 'published') matchStatus = p.published
      else if (statusFilter === 'hidden') matchStatus = !p.published
      else if (statusFilter === 'featured') matchStatus = p.featured

      return matchSearch && matchCat && matchStatus
    })
  }, [posts, searchQuery, categoryFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE))
  const paginatedPosts = useMemo(() => {
    return filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredPosts, currentPage, ITEMS_PER_PAGE])

  const publishedCount = useMemo(() => posts.filter((p) => p.published).length, [posts])
  const featuredCount = useMemo(() => posts.filter((p) => p.featured).length, [posts])
  const hiddenCount = useMemo(() => posts.length - publishedCount, [posts, publishedCount])

  // Word count & read time estimator for editor
  const wordCount = useMemo(() => {
    return form.content.trim().split(/\s+/).filter(Boolean).length
  }, [form.content])
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180))

  return (
    <div className="space-y-6">
      {/* Apple Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
            <span>Hệ Thống CMS Quản Trị Nội Dung</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight mt-1">
            Bài Viết & Dự Án Công Trình
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1 max-w-2xl">
            Đăng tải tư liệu hình ảnh thực tế, quản trị danh mục công trình và khẳng định năng lực thi công của Camera 247 Huế tại Thừa Thiên Huế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
            title="Xuất mục lục bài viết ra file Excel / CSV"
          >
            <Download className="w-4 h-4 text-[#86868B]" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => setShowCatManager(true)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
          >
            <Settings className="w-4 h-4 text-[#86868B]" />
            <span>Danh mục ({categories.length})</span>
          </button>
          <button
            onClick={openNewPostForm}
            className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Bài Công Trình Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Apple KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Tổng Công Trình</span>
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/50">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tabular-nums tracking-tight">
              {posts.length}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Kho tư liệu & giải pháp</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Đang Xuất Bản (Live)</span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/50">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums tracking-tight">
              {publishedCount}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">
              Hiển thị công khai trên website ({posts.length > 0 ? Math.round((publishedCount / posts.length) * 100) : 0}%)
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Dự Án Nổi Bật</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/50">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums tracking-tight">
              {featuredCount}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Ghim tại trang chủ Camera 247</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-semibold uppercase tracking-wider">
            <span>Danh Mục Chuyên Môn</span>
            <div className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/50">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 tabular-nums tracking-tight">
              {categories.length}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Camera, Khóa, Mạng, Báo động...</p>
          </div>
        </div>
      </div>

      {/* Segmented Controls & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Apple Segmented Control for Status */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 self-start lg:self-auto max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
              statusFilter === 'all'
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            Tất cả ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('published')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              statusFilter === 'published'
                ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã đăng ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('featured')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              statusFilter === 'featured'
                ? 'bg-white text-amber-700 font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            Nổi bật ({featuredCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('hidden')
              setCurrentPage(1)
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
              statusFilter === 'hidden'
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            <EyeOff className="w-3 h-3 text-slate-400" />
            Đang ẩn ({hiddenCount})
          </button>
        </div>

        {/* Search, Category Filter & View Mode Toggle */}
        <div className="flex items-center gap-2 flex-1 lg:max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm tiêu đề, địa điểm tại Huế, khách hàng..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0 max-w-[150px] sm:max-w-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Finder View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-xl transition-all',
                viewMode === 'grid' ? 'bg-white text-[#0071E3] shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'
              )}
              title="Chế độ Lưới (Thẻ Dự Án)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-xl transition-all',
                viewMode === 'table' ? 'bg-white text-[#0071E3] shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'
              )}
              title="Chế độ Bảng Danh Sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid View vs Table View */}
      {paginatedPosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200/80">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F]">Không tìm thấy bài viết phù hợp</h3>
            <p className="text-xs text-[#86868B] mt-1 max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc nhấn nút Tạo Bài Viết Mới để thêm dự án thi công.
            </p>
          </div>
          <button
            onClick={openNewPostForm}
            className="inline-flex items-center gap-1.5 bg-[#0071E3] text-white px-4 py-2 rounded-2xl font-semibold text-xs shadow-sm hover:bg-[#0077ED] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Viết Bài Ngay</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* PORTFOLIO GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPosts.map((post) => {
            const catName =
              categories.find((c) => c.id === post.category_id)?.name || post.category?.name || 'Công Trình & Giải Pháp'

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:shadow-lg hover:border-[#0071E3]/40 transition-all duration-300 group"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white/95 text-[#1D1D1F] backdrop-blur-md shadow-xs border border-white/40">
                      📁 {catName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={cn(
                          'p-1.5 rounded-xl backdrop-blur-md transition-all shadow-xs border',
                          post.featured
                            ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold'
                            : 'bg-black/30 text-white/80 hover:bg-black/50 border-white/20'
                        )}
                        title={post.featured ? 'Bỏ ghim nổi bật' : 'Ghim nổi bật trang chủ'}
                      >
                        <Star className={cn('w-3.5 h-3.5', post.featured && 'fill-amber-950')} />
                      </button>

                      <button
                        onClick={() => onTogglePublish(post)}
                        className={cn(
                          'px-2.5 py-1 rounded-xl text-[10.5px] font-bold backdrop-blur-md transition-all shadow-xs border flex items-center gap-1',
                          post.published
                            ? 'bg-emerald-500/90 text-white border-emerald-400'
                            : 'bg-slate-800/80 text-slate-300 border-slate-600'
                        )}
                        title={post.published ? 'Bấm để ẩn khỏi website' : 'Bấm để xuất bản bài viết'}
                      >
                        {post.published ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Live
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Ẩn
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs flex items-center justify-between pointer-events-none">
                    {post.location ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/90 drop-shadow">
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span className="truncate max-w-[200px]">{post.location}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {post.images && post.images.length > 0 && (
                      <span className="text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        📸 {post.images.length} ảnh
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3
                      onClick={() => openEditPostForm(post)}
                      className="font-bold text-base text-[#1D1D1F] hover:text-[#0071E3] transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {post.title}
                    </h3>

                    {post.client_name && (
                      <div className="flex items-center gap-1.5 text-xs text-[#0071E3] font-medium">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{post.client_name}</span>
                      </div>
                    )}

                    {post.excerpt && (
                      <p className="text-xs text-[#86868B] line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Card Meta & Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-[#86868B]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{post.completed_at || 'Mới hoàn thành'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(post.slug)}
                        className="p-1.5 text-slate-400 hover:text-[#0071E3] hover:bg-blue-50 rounded-xl transition-all"
                        title="Sao chép liên kết bài viết"
                      >
                        {copiedSlug === post.slug ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>

                      <a
                        href={`/cong-trinh/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-[#0071E3] hover:bg-blue-50 rounded-xl transition-all"
                        title="Xem trang công khai"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => openEditPostForm(post)}
                        className="p-1.5 text-[#0071E3] hover:bg-blue-50 rounded-xl transition-all"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Xác nhận xóa bài viết "${post.title}"?`)) {
                            onDeletePost(post.id)
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* DETAILED TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[#86868B] font-semibold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Công Trình & Tiêu Đề</th>
                  <th className="py-3.5 px-4">Danh Mục</th>
                  <th className="py-3.5 px-4">Khách Hàng & Vị Trí</th>
                  <th className="py-3.5 px-4">Hoàn Thành</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPosts.map((post) => {
                  const catName =
                    categories.find((c) => c.id === post.category_id)?.name ||
                    post.category?.name ||
                    'Chưa phân loại'

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Title & Thumbnail */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 relative shadow-2xs">
                            {post.cover_image ? (
                              <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                onClick={() => openEditPostForm(post)}
                                className="font-bold text-[#1D1D1F] hover:text-[#0071E3] cursor-pointer transition-colors line-clamp-1"
                              >
                                {post.title}
                              </span>
                              {post.featured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" /> Nổi bật
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#86868B] mt-0.5">
                              <span className="font-mono text-[#0071E3]">/{post.slug}</span>
                              {post.images && post.images.length > 0 && (
                                <span>• 📸 {post.images.length} ảnh</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-[#1D1D1F] text-xs font-medium border border-slate-200/60">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {catName}
                        </span>
                      </td>

                      {/* Client & Location */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-semibold text-[#1D1D1F]">{post.client_name || 'Khách hàng cá nhân'}</div>
                        <div className="text-[11px] text-[#86868B] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{post.location || 'Huế'}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#86868B]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.completed_at || '—'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onTogglePublish(post)}
                            className={cn(
                              'px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5',
                              post.published
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            )}
                            title={post.published ? 'Bấm để ẩn khỏi web' : 'Bấm để hiển thị'}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                post.published ? 'bg-emerald-500' : 'bg-slate-400'
                              )}
                            />
                            {post.published ? 'Đã xuất bản' : 'Đang ẩn'}
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(post)}
                            className={cn(
                              'p-1.5 rounded-xl border transition-all',
                              post.featured
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'text-slate-300 hover:text-slate-600 border-transparent hover:bg-slate-100'
                            )}
                            title={post.featured ? 'Bỏ ghim nổi bật' : 'Ghim nổi bật'}
                          >
                            <Star className={cn('w-3.5 h-3.5', post.featured && 'fill-amber-400 text-amber-500')} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyLink(post.slug)}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#0071E3] hover:bg-blue-50 transition-colors"
                            title="Sao chép liên kết"
                          >
                            {copiedSlug === post.slug ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>

                          <a
                            href={`/cong-trinh/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-400 hover:text-[#0071E3] hover:bg-blue-50 transition-colors"
                            title="Xem trang công khai"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => openEditPostForm(post)}
                            className="p-2 rounded-xl text-[#0071E3] hover:bg-blue-50 border border-blue-200/60 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Xác nhận xóa bài viết "${post.title}"?`)) {
                                onDeletePost(post.id)
                              }
                            }}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apple Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between text-xs text-[#86868B]">
          <span>
            Trang {currentPage} / {totalPages} ({filteredPosts.length} công trình)
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-2xl text-[#1D1D1F] font-semibold border border-slate-200 shadow-2xs transition-all"
            >
              Trước
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-2xl text-[#1D1D1F] font-semibold border border-slate-200 shadow-2xs transition-all"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Post Form Sheet Modal (Apple Sheet Style) */}
      {editingPost !== undefined && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    {editingPost ? 'Chỉnh Sửa Dự Án Công Trình' : 'Đăng Tải Công Trình Mới'}
                  </h3>
                  <p className="text-xs text-[#86868B]">Quản lý tư liệu, bài viết & album ảnh thi công thực tế tại Huế</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPost(undefined)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Selector for New Post */}
            {!editingPost && (
              <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-[#0071E3] whitespace-nowrap flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" /> Mẫu nhanh 1-Click:
                </span>
                <div className="flex items-center gap-2">
                  {POST_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-3 py-1 bg-white hover:bg-blue-100/60 text-[#1D1D1F] border border-blue-200 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs active:scale-95"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left 2 Cols: Main Content */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                      Tiêu Đề Bài Viết / Công Trình *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="VD: Lắp Đặt 32 Camera An Ninh Khách Sạn Hương Giang Huế"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] font-semibold focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                      Slug URL Đường Dẫn *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">/cong-trinh/</span>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                        placeholder="lap-dat-32-camera-khach-san-huong-giang-hue"
                        className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                      Mô Tả Tóm Tắt (Hiển thị xem trước thẻ bài)
                    </label>
                    <textarea
                      rows={2}
                      value={form.excerpt}
                      onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                      placeholder="Tóm tắt ngắn gọn 1-2 câu về giải pháp, quy mô và kết quả nghiệm thu..."
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Content with live word count */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#1D1D1F]">
                        Nội Dung Chi Tiết (Hỗ trợ Markdown)
                      </label>
                      <span className="text-[11px] text-[#86868B]">
                        {wordCount} từ • ~{readTimeMinutes} phút đọc
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={form.content}
                      onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                      placeholder="Nhập nội dung bài viết. Dùng '# ' để tạo tiêu đề mục lớn, '- ' để gạch đầu dòng tính năng..."
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all resize-y font-sans leading-relaxed"
                    />
                  </div>
                </div>

                {/* Right 1 Col: Metadata & Media */}
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-200/60">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">Danh Mục Giải Pháp</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                      className="w-full bg-white border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] transition-all font-medium"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location & Client */}
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">Địa Điểm Tại Huế</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="VD: 51 Lê Lợi, P. Phú Hội, TP. Huế"
                      className="w-full bg-white border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">Khách Hàng / Đơn Vị</label>
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                      placeholder="Khách sạn Hương Giang Resort"
                      className="w-full bg-white border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">Ngày Hoàn Thành</label>
                    <input
                      type="date"
                      value={form.completed_at}
                      onChange={(e) => setForm((p) => ({ ...p, completed_at: e.target.value }))}
                      className="w-full bg-white border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] transition-all"
                    />
                  </div>

                  {/* Cover Image Upload */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">Ảnh Bìa Đại Diện</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.cover_image}
                        onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))}
                        placeholder="https://... hoặc tải ảnh"
                        className="flex-1 bg-white border border-slate-200/80 rounded-2xl px-3 py-1.5 text-xs text-[#1D1D1F] font-mono focus:outline-none focus:border-[#0071E3]"
                      />
                      <label className="px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-[#1D1D1F] rounded-2xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0 transition-all">
                        <ImageIcon className="w-3.5 h-3.5 text-[#0071E3]" />
                        {uploadingCover ? '...' : 'Tải'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          disabled={uploadingCover}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {form.cover_image && (
                      <div className="mt-2 relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                        <img src={form.cover_image} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, cover_image: '' }))}
                          className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:scale-110 transition-transform"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Album Gallery */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#1D1D1F]">Album Ảnh Thi Công ({form.images.length})</label>
                      <label className="text-[11px] font-semibold text-[#0071E3] hover:underline cursor-pointer flex items-center gap-0.5">
                        <Plus className="w-3 h-3" />
                        {uploadingGallery ? 'Đang tải...' : 'Thêm ảnh'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          disabled={uploadingGallery}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {form.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-2xs"
                          >
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))
                              }
                              className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Toggles */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1D1D1F]">
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                        className="accent-[#0071E3] w-4 h-4 rounded"
                      />
                      <span>Hiển thị công khai trên website</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-amber-700">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                        className="accent-amber-500 w-4 h-4 rounded"
                      />
                      <span className="flex items-center gap-1 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Ghim nổi bật (Trang chủ)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button Bar */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  disabled={savingPost}
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {savingPost ? 'Đang lưu trữ...' : editingPost ? 'Cập Nhật Công Trình' : 'Xuất Bản Công Trình Mới'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPost(undefined)}
                  className="px-6 py-3 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs sm:text-sm border border-slate-200 font-semibold transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Sheet Modal */}
      {showCatManager && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                    Quản Lý Danh Mục Công Trình
                  </h3>
                  <p className="text-[11px] text-[#86868B]">Phân loại dịch vụ camera, khóa, mạng wifi, báo động</p>
                </div>
              </div>
              <button
                onClick={() => setShowCatManager(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-80 overflow-y-auto space-y-2.5">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/60 transition-colors"
                >
                  {editingCatId === c.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 bg-white border border-[#0071E3] rounded-xl px-3 py-1 text-xs text-[#1D1D1F] focus:outline-none"
                      />
                      <button
                        onClick={async () => {
                          if (editingCatName.trim()) {
                            await onUpdateCategory(c.id, editingCatName.trim())
                            setEditingCatId(null)
                          }
                        }}
                        className="bg-emerald-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-2xs"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-semibold"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span className="text-xs font-bold text-[#1D1D1F]">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCatId(c.id)
                            setEditingCatName(c.name)
                          }}
                          className="p-1.5 text-[#0071E3] hover:bg-blue-50 rounded-xl transition-colors"
                          title="Sửa tên danh mục"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Xác nhận xóa danh mục "${c.name}"?`)) {
                              await onDeleteCategory(c.id)
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Tên danh mục mới (VD: Hệ thống tổng đài)..."
                className="flex-1 bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <button
                type="button"
                onClick={async () => {
                  if (newCatName.trim()) {
                    await onAddCategory(newCatName.trim())
                    setNewCatName('')
                  }
                }}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold px-4 py-2 rounded-2xl text-xs transition-all shadow-xs shrink-0"
              >
                + Thêm Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
