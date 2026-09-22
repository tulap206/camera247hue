'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
  Settings,
  Image as ImageIcon,
  Calendar,
  MapPin,
  X,
  Sparkles,
} from 'lucide-react'
import type { Post, Category } from '@/lib/supabase'

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-yellow-400" />
            Quản Lý Bài Viết & Công Trình Tiêu Biểu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Đăng tải dự án thực tế, hình ảnh thi công và kinh nghiệm lắp đặt hiển thị trên landing page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowCatManager(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
          >
            <Settings className="w-4 h-4 text-yellow-400" /> Quản Lý Danh Mục
          </button>
          <button
            onClick={openNewPostForm}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Viết Bài Công Trình Mới
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm theo tiêu đề, địa điểm công trình, khách hàng..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="hidden">Ẩn</option>
            <option value="featured">Nổi bật ⭐</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800/60">
          {paginatedPosts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs sm:text-sm">
              Chưa có bài viết nào phù hợp với bộ lọc.
            </div>
          ) : (
            paginatedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-28 h-28 sm:h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base group-hover:text-yellow-400 transition-colors">
                      {post.title}
                    </span>
                    {post.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                        <Star className="w-3 h-3 fill-yellow-400" /> Nổi bật
                      </span>
                    )}
                    {post.published ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Ẩn
                      </span>
                    )}
                  </div>

                  {post.excerpt && (
                    <p className="text-xs text-slate-400 line-clamp-1">{post.excerpt}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5 font-sans">
                    {post.category && (
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-300 font-medium">
                        📁 {post.category.name}
                      </span>
                    )}
                    {post.location && <span>📍 {post.location}</span>}
                    {post.completed_at && <span>📅 {post.completed_at}</span>}
                    <a
                      href={`/cong-trinh/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono inline-flex items-center gap-1"
                    >
                      /{post.slug} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60 justify-end">
                  <button
                    onClick={() => onTogglePublish(post)}
                    className={`p-2 rounded-xl transition-colors ${
                      post.published
                        ? 'text-emerald-400 hover:bg-emerald-400/10'
                        : 'text-slate-600 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                    title={post.published ? 'Bấm để ẩn bài' : 'Bấm để hiển thị'}
                  >
                    {post.published ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openEditPostForm(post)}
                    className="p-2 rounded-xl text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xác nhận xóa bài viết "${post.title}"?`)) {
                        onDeletePost(post.id)
                      }
                    }}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-colors"
                    title="Xóa bài"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Trang {currentPage} / {totalPages} ({filteredPosts.length} bài viết)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-white font-medium"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-white font-medium"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Form Modal */}
      {editingPost !== undefined && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121620] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E121A] shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                {editingPost ? 'Chỉnh Sửa Bài Viết Công Trình' : 'Tạo Bài Viết Công Trình Mới'}
              </h3>
              <button onClick={() => setEditingPost(undefined)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tiêu Đề Bài Viết *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Lắp Đặt 32 Camera An Ninh Khách Sạn Hương Giang Huế"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="lap-dat-32-camera-an-ninh-khach-san-huong-giang-hue"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Danh Mục Công Trình</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày Hoàn Thành</label>
                  <input
                    type="date"
                    value={form.completed_at}
                    onChange={(e) => setForm((p) => ({ ...p, completed_at: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Địa Điểm Tại Huế</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="VD: P. Phú Hội, TP. Huế"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Khách Hàng / Đơn Vị</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                    placeholder="Khách sạn Hương Giang"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ảnh Bìa Đại Diện</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.cover_image}
                    onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))}
                    placeholder="https://... hoặc tải ảnh lên"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 font-mono"
                  />
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
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
                  <div className="mt-2 relative w-24 h-24 border border-slate-700 rounded-xl overflow-hidden bg-black">
                    <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, cover_image: '' }))}
                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Album gallery */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Album Ảnh Thực Tế Thi Công</label>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700">
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
                      <div key={index} className="relative aspect-square border border-slate-700 rounded-lg overflow-hidden bg-black group">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mô Tả Ngắn</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="Mô tả tóm tắt 1-2 câu về giải pháp..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nội Dung Chi Tiết</label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Nhập nội dung bài viết. Dùng '- ' cho gạch đầu dòng, '# ' cho tiêu đề mục..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 font-sans resize-y"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                    className="accent-yellow-400 w-4 h-4"
                  />
                  <span>Hiển thị trên website</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="accent-yellow-400 w-4 h-4"
                  />
                  <span className="text-yellow-400 font-semibold">Ghim nổi bật ⭐ (Trang chủ)</span>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-800 flex gap-3">
                <button
                  type="submit"
                  disabled={savingPost}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {savingPost ? 'Đang lưu...' : (editingPost ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPost(undefined)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs sm:text-sm border border-slate-700 font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCatManager && (
        <div className="fixed inset-0 bg-black/85 z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121620] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0E121A]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-yellow-400" />
                Quản Lý Danh Mục Công Trình
              </h3>
              <button onClick={() => setShowCatManager(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-72 overflow-y-auto space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  {editingCatId === c.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-yellow-400 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <button
                        onClick={async () => {
                          if (editingCatName.trim()) {
                            await onUpdateCategory(c.id, editingCatName.trim())
                            setEditingCatId(null)
                          }
                        }}
                        className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="bg-slate-800 text-slate-400 px-2 py-1 rounded-lg text-xs"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-white">{c.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCatId(c.id)
                            setEditingCatName(c.name)
                          }}
                          className="p-1 text-yellow-400 hover:bg-yellow-400/10 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Xóa danh mục "${c.name}"?`)) {
                              await onDeleteCategory(c.id)
                            }
                          }}
                          className="p-1 text-rose-400 hover:bg-rose-400/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0E121A] flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Tên danh mục mới..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <button
                type="button"
                onClick={async () => {
                  if (newCatName.trim()) {
                    await onAddCategory(newCatName.trim())
                    setNewCatName('')
                  }
                }}
                className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors"
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
