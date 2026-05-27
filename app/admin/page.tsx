'use client'

import { useState, useEffect } from 'react'
import { Shield, Eye, EyeOff, LogOut, Plus, Edit, Trash2, CheckCircle, XCircle, Star, StarOff, Image as ImageIcon, MessageSquare } from 'lucide-react'
import { supabase, type Post, type Category, type ContactMessage } from '@/lib/supabase'

const ADMIN_KEY = 'camera247hue_admin_auth'

// ========== Login Component ==========
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    
    if (res.ok) {
      localStorage.setItem(ADMIN_KEY, 'true')
      onLogin()
    } else {
      setError('Mật khẩu không đúng. Vui lòng thử lại.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F5C518] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-9 h-9 text-black" />
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif' }}
            className="text-2xl font-bold text-white">ĐĂNG NHẬP ADMIN</h1>
          <p className="text-gray-500 text-sm mt-1">Camera 247 Huế</p>
        </div>

        <form onSubmit={handleLogin}
          className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800">
          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1.5">Mật Khẩu</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-3 text-white pr-10 focus:outline-none focus:border-[#F5C518] transition-colors"
                placeholder="••••••••"
                autoFocus
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#F5C518] text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-60">
            {loading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-4">
          Camera 247 Huế © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

// ========== Post Form ==========
function PostForm({
  post,
  categories,
  onSave,
  onCancel,
  onAddCategory,
}: {
  post?: Post | null
  categories: Category[]
  onSave: () => void
  onCancel: () => void
  onAddCategory: () => void
}) {
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    cover_image: post?.cover_image || '',
    category_id: post?.category_id || '',
    location: post?.location || '',
    client_name: post?.client_name || '',
    completed_at: post?.completed_at || '',
    featured: post?.featured || false,
    published: post?.published ?? true,
    images: post?.images || [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Category creation state
  const [newCatName, setNewCatName] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [addingCat, setAddingCat] = useState(false)

  // Upload state
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const generateSlug = (title: string) => {
    return title.toLowerCase()
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

  const handleTitleChange = (title: string) => {
    setForm(p => ({
      ...p,
      title,
      slug: !post ? generateSlug(title) : p.slug
    }))
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    setAddingCat(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName }),
      })
      if (res.ok) {
        const newCat = await res.json()
        onAddCategory()
        setForm(p => ({ ...p, category_id: newCat.id }))
        setNewCatName('')
        setShowAddCat(false)
      } else {
        const errData = await res.json()
        alert(errData.error || 'Lỗi khi tạo danh mục')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setAddingCat(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        setForm(p => ({ ...p, cover_image: data.url }))
      } else {
        const errData = await res.json()
        alert(errData.error || 'Lỗi khi tải ảnh')
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
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
        }
      }
      setForm(p => ({ ...p, images: [...p.images, ...uploadedUrls] }))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setForm(p => ({
      ...p,
      images: p.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) {
      setError('Vui lòng nhập tiêu đề và slug.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/posts', {
      method: post ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: post?.id }),
    })

    if (res.ok) {
      onSave()
    } else {
      const data = await res.json()
      setError(data.error || 'Có lỗi xảy ra.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-2xl bg-[#1A1A1A] rounded-2xl border border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h2 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-lg font-bold text-white">
              {post ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Tiêu Đề *</label>
              <input
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518]"
                placeholder="VD: Camera An Ninh Khách Sạn ABC Huế"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Slug (URL) *</label>
              <input
                value={form.slug}
                onChange={e => setForm(p => ({...p, slug: e.target.value}))}
                className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#F5C518]"
                placeholder="camera-an-ninh-khach-san-abc-hue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Danh Mục</label>
                <div className="flex gap-2">
                  <select
                    value={form.category_id}
                    onChange={e => setForm(p => ({...p, category_id: e.target.value}))}
                    className="flex-1 bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518]"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCat(!showAddCat)}
                    className="bg-gray-800 text-[#F5C518] px-3.5 rounded-xl border border-gray-700 hover:bg-gray-700 font-bold transition-all"
                  >
                    +
                  </button>
                </div>
                {showAddCat && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="Tên nhóm công trình mới..."
                      className="flex-1 bg-[#111] border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#F5C518]"
                    />
                    <button
                      type="button"
                      disabled={addingCat}
                      onClick={handleAddCategory}
                      className="bg-[#F5C518] text-black text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-yellow-400 disabled:opacity-50"
                    >
                      {addingCat ? 'Lưu...' : 'Lưu'}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Ngày Hoàn Thành</label>
                <input
                  type="date"
                  value={form.completed_at}
                  onChange={e => setForm(p => ({...p, completed_at: e.target.value}))}
                  className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Địa Điểm</label>
                <input
                  value={form.location}
                  onChange={e => setForm(p => ({...p, location: e.target.value}))}
                  className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518]"
                  placeholder="VD: Phường Phú Hội, Huế"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Tên Khách Hàng</label>
                <input
                  value={form.client_name}
                  onChange={e => setForm(p => ({...p, client_name: e.target.value}))}
                  className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518]"
                  placeholder="Tên khách hàng/đơn vị"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Ảnh Bìa</label>
              <div className="flex gap-2">
                <input
                  value={form.cover_image}
                  onChange={e => setForm(p => ({...p, cover_image: e.target.value}))}
                  className="flex-1 bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#F5C518]"
                  placeholder="https://... hoặc đường dẫn ảnh"
                />
                <label className="bg-[#1A1A1A] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-700 text-sm cursor-pointer hover:bg-gray-800 transition-all font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  {uploadingCover ? 'Đang tải...' : 'Tải ảnh'}
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
                <div className="mt-2 relative w-24 h-24 border border-gray-800 rounded-lg overflow-hidden bg-black">
                  <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, cover_image: '' }))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Album Ảnh Công Trình</label>
              <div className="flex items-center gap-3">
                <label className="bg-[#1A1A1A] text-[#F5C518] hover:text-yellow-400 px-4 py-2.5 rounded-xl border border-gray-700 text-sm cursor-pointer hover:bg-gray-800 transition-all font-semibold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  {uploadingGallery ? 'Đang tải...' : 'Thêm ảnh công trình'}
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
              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-3">
                  {form.images.map((img, index) => (
                    <div key={index} className="relative aspect-square border border-gray-800 rounded-lg overflow-hidden bg-black group">
                      <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Mô Tả Ngắn</label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={e => setForm(p => ({...p, excerpt: e.target.value}))}
                className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518] resize-none"
                placeholder="Mô tả ngắn về công trình..."
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Nội Dung (HTML)</label>
              <textarea
                rows={8}
                value={form.content}
                onChange={e => setForm(p => ({...p, content: e.target.value}))}
                className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#F5C518] resize-y"
                placeholder="<h2>Mô tả công trình</h2><p>Nội dung...</p>"
              />
              <p className="text-gray-600 text-xs mt-1">Hỗ trợ HTML: h2, h3, p, ul, li, strong</p>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published}
                  onChange={e => setForm(p => ({...p, published: e.target.checked}))}
                  className="accent-yellow-400" />
                <span className="text-gray-400 text-sm">Hiển thị</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured}
                  onChange={e => setForm(p => ({...p, featured: e.target.checked}))}
                  className="accent-yellow-400" />
                <span className="text-gray-400 text-sm">Nổi bật (trang chủ)</span>
              </label>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#F5C518] text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-60">
                {loading ? 'Đang lưu...' : (post ? 'Cập Nhật' : 'Tạo Bài Viết')}
              </button>
              <button type="button" onClick={onCancel}
                className="px-6 bg-[#111] text-gray-400 py-3 rounded-xl font-medium hover:text-white border border-gray-700 transition-colors">
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ========== Dashboard ==========
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'posts' | 'contacts'>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Post | null | undefined>(undefined) // undefined=closed, null=new
  const [stats, setStats] = useState({ posts: 0, published: 0, contacts: 0, unread: 0 })

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/data')
      if (res.ok) {
        const { posts: postsData, categories: catsData, contacts: contactsData } = await res.json()
        setPosts(postsData || [])
        setCategories(catsData || [])
        setContacts(contactsData || [])
        const postCount = postsData?.length || 0
        const contactCount = contactsData?.length || 0
        const published = (postsData || []).filter((p: Post) => p.published).length
        const unread = (contactsData || []).filter((c: ContactMessage) => !c.read).length
        setStats({ posts: postCount, published, contacts: contactCount, unread })
      } else {
        console.error('Failed to fetch admin data')
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bài viết này?')) return
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const handleTogglePublish = async (post: Post) => {
    await fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: !post.published }),
    })
    fetchAll()
  }

  const handleMarkRead = async (id: string) => {
    await fetch('/api/contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    })
    fetchAll()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <div className="bg-[#1A1A1A] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F5C518] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="font-bold text-white text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>
              CAMERA 247 HUẾ — ADMIN
            </div>
            <div className="text-gray-500 text-xs">Quản trị nội dung</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-gray-500 hover:text-[#F5C518] text-xs transition-colors">
            Xem trang web →
          </a>
          <button onClick={onLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng bài viết', value: stats.posts, color: '#F5C518' },
            { label: 'Đã đăng', value: stats.published, color: '#22c55e' },
            { label: 'Liên hệ', value: stats.contacts, color: '#3b82f6' },
            { label: 'Chưa đọc', value: stats.unread, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800">
              <div className="text-3xl font-bold mb-1" style={{ color: s.color, fontFamily: 'Oswald, sans-serif' }}>
                {s.value}
              </div>
              <div className="text-gray-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('posts')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'posts' ? 'bg-[#F5C518] text-black' : 'bg-[#1A1A1A] text-gray-400 border border-gray-700 hover:text-white'
            }`}>
            📝 Bài Viết ({stats.posts})
          </button>
          <button onClick={() => setTab('contacts')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              tab === 'contacts' ? 'bg-[#F5C518] text-black' : 'bg-[#1A1A1A] text-gray-400 border border-gray-700 hover:text-white'
            }`}>
            <MessageSquare className="w-4 h-4" />
            Liên Hệ ({stats.contacts})
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.unread}
              </span>
            )}
          </button>
        </div>

        {/* Posts tab */}
        {tab === 'posts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ fontFamily: 'Oswald, sans-serif' }}
                className="text-lg font-bold text-white">QUẢN LÝ BÀI VIẾT</h2>
              <button
                onClick={() => setEditing(null)}
                className="flex items-center gap-2 bg-[#F5C518] text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all">
                <Plus className="w-4 h-4" /> Tạo Bài Mới
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><div className="spinner" /></div>
            ) : (
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id}
                      className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm truncate">{post.title}</span>
                          {post.featured && <Star className="w-3.5 h-3.5 text-[#F5C518] flex-shrink-0" />}
                          {post.published ? (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Đã đăng</span>
                          ) : (
                            <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">Ẩn</span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs flex gap-3 flex-wrap">
                          {post.category && <span>📁 {post.category.name}</span>}
                          {post.location && <span>📍 {post.location}</span>}
                          <span>🔗 /{post.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleTogglePublish(post)}
                          className={`p-2 rounded-lg transition-colors ${
                            post.published
                              ? 'text-green-400 hover:bg-green-400/10'
                              : 'text-gray-600 hover:bg-gray-600/10'
                          }`}
                          title={post.published ? 'Ẩn bài' : 'Hiển thị'}>
                          {post.published ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditing(post)}
                          className="p-2 rounded-lg text-[#F5C518] hover:bg-[#F5C518]/10 transition-colors"
                          title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(post.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Contacts tab */}
        {tab === 'contacts' && (
          <div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-lg font-bold text-white mb-4">YÊU CẦU LIÊN HỆ</h2>
            {loading ? (
              <div className="flex justify-center py-12"><div className="spinner" /></div>
            ) : (
              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Chưa có yêu cầu liên hệ nào.</div>
                ) : (
                  contacts.map(c => (
                    <div key={c.id}
                      className={`bg-[#1A1A1A] rounded-xl p-4 border transition-colors ${
                        c.read ? 'border-gray-800' : 'border-[#F5C518]/30'
                      }`}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">{c.name}</span>
                            {!c.read && (
                              <span className="text-xs bg-[#F5C518]/20 text-[#F5C518] px-2 py-0.5 rounded-full">Mới</span>
                            )}
                            {c.service && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{c.service}</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs flex gap-4 mb-2 flex-wrap">
                            <a href={`tel:${c.phone}`} className="hover:text-[#F5C518]">📞 {c.phone}</a>
                            {c.email && <a href={`mailto:${c.email}`} className="hover:text-[#F5C518]">✉️ {c.email}</a>}
                            <span>🕐 {new Date(c.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                          {c.message && <p className="text-gray-400 text-sm bg-[#111] p-3 rounded-lg">{c.message}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!c.read && (
                            <button onClick={() => handleMarkRead(c.id)}
                              className="text-xs bg-[#F5C518]/10 text-[#F5C518] px-3 py-1.5 rounded-lg hover:bg-[#F5C518]/20 transition-colors border border-[#F5C518]/30">
                              Đánh dấu đã đọc
                            </button>
                          )}
                          <a href={`tel:${c.phone}`}
                            className="text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30">
                            Gọi lại
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Form Modal */}
      {editing !== undefined && (
        <PostForm
          post={editing}
          categories={categories}
          onSave={() => { setEditing(undefined); fetchAll() }}
          onCancel={() => setEditing(undefined)}
          onAddCategory={fetchAll}
        />
      )}
    </div>
  )
}

// ========== Main Admin Page ==========
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem(ADMIN_KEY)
    setIsLoggedIn(auth === 'true')
    setChecking(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY)
    setIsLoggedIn(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return isLoggedIn
    ? <Dashboard onLogout={handleLogout} />
    : <LoginForm onLogin={() => setIsLoggedIn(true)} />
}
