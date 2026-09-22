'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  ExternalLink,
  Settings,
  Image as ImageIcon,
  Calendar,
  MapPin,
  X,
  Sparkles,
  Check,
  FolderPlus,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { Post, Category } from '@/lib/supabase'
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
  const [editingPost, setEditingPost] = useState<Post | null | undefined>(undefined) // undefined = closed, null = create new
  const [showCatManager, setShowCatManager] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

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
  }, [filteredPosts, currentPage])

  const publishedCount = useMemo(() => posts.filter((p) => p.published).length, [posts])
  const featuredCount = useMemo(() => posts.filter((p) => p.featured).length, [posts])

  return (
    <div className="space-y-6">
      {/* Apple Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] tracking-wide uppercase">
            <FileText className="w-4 h-4" />
            <span>Quản Trị Nội Dung CMS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight mt-1">
            Bài Viết & Công Trình Tiêu Biểu
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1">
            Đăng tải dự án thực tế, tư liệu ảnh thi công và câu chuyện nghiệm thu tại Thừa Thiên Huế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowCatManager(true)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-[#1D1D1F] px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm border border-slate-200/80 transition-all shadow-2xs"
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

      {/* Segmented Controls & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Apple Segmented Control for Status */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 self-start md:self-auto max-w-full overflow-x-auto">
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
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
              statusFilter === 'hidden'
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            )}
          >
            Đang ẩn ({posts.length - publishedCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm tiêu đề, địa điểm, khách hàng..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all shrink-0"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Post Items Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="divide-y divide-slate-100">
          {paginatedPosts.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#1D1D1F]">Không tìm thấy bài viết phù hợp</p>
              <p className="text-xs text-[#86868B]">Thử đổi từ khóa tìm kiếm hoặc bấm nút Viết bài mới ở góc trên.</p>
            </div>
          ) : (
            paginatedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-28 h-28 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 relative shadow-2xs">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1D1D1F] text-sm sm:text-base group-hover:text-[#0071E3] transition-colors line-clamp-1">
                      {post.title}
                    </span>
                    {post.featured && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Nổi bật
                      </span>
                    )}
                    {post.published ? (
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Đang ẩn
                      </span>
                    )}
                  </div>

                  {post.excerpt && (
                    <p className="text-xs text-[#86868B] line-clamp-1">{post.excerpt}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-[#86868B] flex-wrap pt-0.5">
                    {post.category && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-[#1D1D1F] font-medium border border-slate-200/60">
                        📁 {post.category.name}
                      </span>
                    )}
                    {post.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#86868B]" />
                        {post.location}
                      </span>
                    )}
                    {post.completed_at && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#86868B]" />
                        {post.completed_at}
                      </span>
                    )}
                    <a
                      href={`/cong-trinh/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0071E3] hover:underline font-mono inline-flex items-center gap-1 ml-auto sm:ml-0"
                    >
                      /{post.slug} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 justify-end">
                  <button
                    onClick={() => onTogglePublish(post)}
                    className={cn(
                      'p-2 rounded-xl transition-all',
                      post.published
                        ? 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200/60'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 border border-slate-200/60'
                    )}
                    title={post.published ? 'Bấm để ẩn bài khỏi website' : 'Bấm để xuất bản bài viết'}
                  >
                    {post.published ? <CheckCircle2 className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditPostForm(post)}
                    className="p-2 rounded-xl text-[#0071E3] hover:bg-blue-50 border border-blue-200/60 transition-colors"
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
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors"
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Apple Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-[#86868B]">
            <span>
              Trang {currentPage} / {totalPages} ({filteredPosts.length} bài viết)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 rounded-xl text-[#1D1D1F] font-medium border border-slate-200 shadow-2xs transition-all"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 rounded-xl text-[#1D1D1F] font-medium border border-slate-200 shadow-2xs transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Form Sheet Modal (iOS Sheet Style) */}
      {editingPost !== undefined && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                    {editingPost ? 'Chỉnh Sửa Bài Viết Công Trình' : 'Viết Bài Công Trình Mới'}
                  </h3>
                  <p className="text-[11px] text-[#86868B]">Hiển thị công trình tiêu biểu trên Camera 247 Huế</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPost(undefined)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Tiêu Đề Bài Viết *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Lắp Đặt 32 Camera An Ninh Khách Sạn Hương Giang Huế"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="lap-dat-32-camera-an-ninh-khach-san-huong-giang-hue"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Danh Mục Công Trình</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Ngày Hoàn Thành</label>
                  <input
                    type="date"
                    value={form.completed_at}
                    onChange={(e) => setForm((p) => ({ ...p, completed_at: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Địa Điểm Tại Huế</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="VD: P. Phú Hội, TP. Huế"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Tên Khách Hàng / Đơn Vị</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                    placeholder="Khách sạn Hương Giang"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Ảnh Bìa Đại Diện</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.cover_image}
                    onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))}
                    placeholder="https://... hoặc tải ảnh từ máy"
                    className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] font-mono focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1D1D1F] rounded-2xl text-xs font-semibold cursor-pointer border border-slate-200 flex items-center gap-1.5 transition-all">
                    <ImageIcon className="w-4 h-4 text-[#0071E3]" />
                    {uploadingCover ? 'Đang tải...' : 'Tải Ảnh'}
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
                  <div className="mt-2.5 relative w-24 h-24 border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 shadow-2xs">
                    <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, cover_image: '' }))}
                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Album gallery */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Album Ảnh Thực Tế Thi Công</label>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0071E3] rounded-2xl text-xs font-semibold cursor-pointer border border-slate-200 transition-all">
                  <Plus className="w-4 h-4" />
                  {uploadingGallery ? 'Đang tải...' : 'Thêm nhiều ảnh công trình'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>
                {form.images && form.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2.5">
                    {form.images.map((img, index) => (
                      <div key={index} className="relative aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-100 group shadow-2xs">
                        <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}
                          className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Mô Tả Tóm Tắt (1-2 câu)</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="Mô tả tóm tắt về giải pháp camera / mạng / khóa cho khách..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">Nội Dung Chi Tiết</label>
                <textarea
                  rows={7}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Nhập nội dung bài viết. Dùng '- ' cho gạch đầu dòng, '# ' cho tiêu đề mục..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10 transition-all resize-y font-sans"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#1D1D1F]">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                    className="accent-[#0071E3] w-4 h-4 rounded"
                  />
                  <span>Hiển thị trên website</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#1D1D1F]">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="accent-[#0071E3] w-4 h-4 rounded"
                  />
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Ghim nổi bật (Trang chủ)
                  </span>
                </label>
              </div>

              {/* Submit Button Bar */}
              <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                <button
                  type="submit"
                  disabled={savingPost}
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-2.5 rounded-2xl text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-50"
                >
                  {savingPost ? 'Đang lưu...' : editingPost ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPost(undefined)}
                  className="px-5 py-2.5 bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 rounded-2xl text-xs sm:text-sm border border-slate-200 font-medium transition-all"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200/60">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">
                  Quản Lý Danh Mục Công Trình
                </h3>
              </div>
              <button
                onClick={() => setShowCatManager(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-72 overflow-y-auto space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  {editingCatId === c.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 bg-white border border-[#0071E3] rounded-xl px-2.5 py-1 text-xs text-[#1D1D1F]"
                      />
                      <button
                        onClick={async () => {
                          if (editingCatName.trim()) {
                            await onUpdateCategory(c.id, editingCatName.trim())
                            setEditingCatId(null)
                          }
                        }}
                        className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="bg-slate-200 text-slate-700 px-2 py-1 rounded-xl text-xs"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-[#1D1D1F]">{c.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCatId(c.id)
                            setEditingCatName(c.name)
                          }}
                          className="p-1.5 text-[#0071E3] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Xóa danh mục "${c.name}"?`)) {
                              await onDeleteCategory(c.id)
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                placeholder="Tên danh mục mới..."
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-blue-500/10"
              />
              <button
                type="button"
                onClick={async () => {
                  if (newCatName.trim()) {
                    await onAddCategory(newCatName.trim())
                    setNewCatName('')
                  }
                }}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold px-4 py-2 rounded-2xl text-xs transition-all shadow-xs"
              >
                Thêm Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
