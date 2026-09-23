'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, type Post, type Category } from '@/lib/supabase'
import { SAMPLE_POSTS } from '@/lib/camera247-data'
import { MapPin, Calendar, ArrowRight, Search, Camera, ZoomIn, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import ImageLightboxModal from '@/components/ImageLightboxModal'

const PAGE_SIZE = 9

export default function ProjectsList({
  categories,
  activeCategory,
  currentPage,
}: {
  categories: Category[]
  activeCategory?: string
  currentPage: number
}) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean
    images: string[]
    title: string
    initialIndex: number
  }>({
    isOpen: false,
    images: [],
    title: '',
    initialIndex: 0,
  })

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line
  }, [activeCategory, currentPage])

  async function fetchPosts() {
    setLoading(true)
    let fetchedData: any[] = []
    let fetchedCount = 0

    try {
      let query = supabase
        .from('posts')
        .select('*, category:categories(*)', { count: 'exact' })
        .eq('published', true)
        .order('completed_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (activeCategory) {
        const cat = categories.find((c) => c.slug === activeCategory)
        if (cat) query = query.eq('category_id', cat.id)
      }

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }

      const from = (currentPage - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data, count, error } = await query
      if (!error && data && data.length > 0) {
        fetchedData = data
        fetchedCount = count || data.length
      }
    } catch {
      // ignore
    }

    // Fallback to SAMPLE_POSTS if supabase returns empty or error
    if (fetchedData.length === 0) {
      let filtered = (SAMPLE_POSTS as unknown as Post[]).filter((p) => p.published)
      if (activeCategory) {
        const cat = categories.find((c) => c.slug === activeCategory)
        if (cat) filtered = filtered.filter((p) => p.category_id === cat.id)
      }
      if (search) {
        filtered = filtered.filter((p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.excerpt?.toLowerCase().includes(search.toLowerCase())
        )
      }
      filtered.sort(
        (a, b) =>
          new Date(b.completed_at || b.created_at || 0).getTime() -
          new Date(a.completed_at || a.created_at || 0).getTime()
      )
      fetchedData = filtered
      fetchedCount = filtered.length
    }

    setPosts(fetchedData)
    setTotal(fetchedCount)
    setLoading(false)
  }

  const handleCategoryChange = (slug?: string) => {
    const url = slug ? `/cong-trinh?category=${slug}` : '/cong-trinh'
    router.push(url)
  }

  const handleOpenZoom = (e: React.MouseEvent, post: any) => {
    e.preventDefault()
    e.stopPropagation()
    const imgs: string[] = []
    if (post.cover_image) imgs.push(post.cover_image)
    if (Array.isArray(post.images)) {
      post.images.forEach((im: string) => {
        if (im && !imgs.includes(im)) imgs.push(im)
      })
    }
    if (imgs.length > 0) {
      setLightboxState({
        isOpen: true,
        images: imgs,
        title: post.title,
        initialIndex: 0,
      })
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="bg-brand-bg min-h-[50vh] pb-20 sm:pb-12">
      <div className="container-page py-8 sm:py-12">
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm công trình..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
              className="input-field pl-10"
            />
          </div>

          <div className="-mx-5 px-5 overflow-x-auto scrollbar-none scroll-snap-x sm:mx-0 sm:px-0 sm:overflow-visible">
            <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
              <button
                onClick={() => handleCategoryChange(undefined)}
                className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all shrink-0 ${
                  !activeCategory
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-white text-brand-muted border border-brand-border hover:text-brand-navy'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all shrink-0 ${
                    activeCategory === cat.slug
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'bg-white text-brand-muted border border-brand-border hover:text-brand-navy'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-brand-muted text-sm mb-6 font-medium">
          {loading ? 'Đang tải...' : `${total} công trình thi công${activeCategory ? ' trong mục này' : ''}`}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 rounded-[24px] bg-white border border-brand-border">
            <Camera className="w-10 h-10 text-brand-muted/40 mx-auto mb-4" />
            <p className="text-brand-muted text-lg">Chưa có công trình nào trong mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group block bg-white rounded-[20px] overflow-hidden border border-brand-border hover:shadow-lift transition-all duration-300 ease-out flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] bg-brand-soft relative overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-brand-muted/40" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3 bg-white/95 text-brand-navy text-[11px] font-semibold px-2.5 py-1 rounded-md z-10 shadow-xs">
                        {post.category.name}
                      </div>
                    )}
                    {post.featured && (
                      <div className="absolute top-3 right-3 bg-brand-yellow text-brand-navy text-[11px] font-semibold px-2.5 py-1 rounded-md z-10 shadow-xs">
                        Nổi bật
                      </div>
                    )}

                    {/* Quick Zoom Overlay */}
                    <div
                      onClick={(e) => handleOpenZoom(e, post)}
                      className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in z-10"
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-brand-navy text-xs font-bold shadow-md">
                        <ZoomIn className="w-3.5 h-3.5 text-brand-navy" />
                        Phóng to ảnh
                      </span>
                    </div>
                  </div>

                  <Link href={`/cong-trinh/${post.slug}`} className="block p-4 sm:p-5">
                    <h3 className="font-heading font-bold text-brand-navy mb-2 line-clamp-2 group-hover:text-brand-yellow-dark transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-brand-muted text-sm mb-3 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                  </Link>
                </div>

                <div className="p-4 sm:p-5 pt-0 mt-auto">
                  <div className="flex items-center justify-between pt-3 border-t border-brand-border/60 text-xs text-brand-muted">
                    <div className="flex items-center gap-3 flex-wrap">
                      {post.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-yellow-dark" /> {post.location}
                        </span>
                      )}
                      {post.completed_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-navy" />
                          {new Date(post.completed_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/cong-trinh/${post.slug}`}
                      className="text-[11px] font-semibold text-brand-yellow-dark hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-brand-border/60">
            <span className="text-xs text-brand-muted font-medium">
              Hiển thị <strong className="text-brand-navy">{(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, total)}</strong> trong tổng số <strong className="text-brand-navy">{total}</strong> công trình • Trang {currentPage} / {totalPages}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {/* Previous button */}
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('page', String(Math.max(1, currentPage - 1)))
                  router.push(url.pathname + url.search)
                }}
                className="px-3 py-2 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-brand-navy text-xs font-semibold border border-brand-border shadow-2xs transition-all flex items-center gap-1"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>

              {/* Number buttons */}
              {(() => {
                const getPageList = (): (number | string)[] => {
                  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
                  if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
                  if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
                  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
                }
                return getPageList().map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`p-dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 font-bold select-none text-xs">
                        •••
                      </span>
                    )
                  }
                  const pageNum = p as number
                  const isActive = pageNum === currentPage
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        const url = new URL(window.location.href)
                        url.searchParams.set('page', String(pageNum))
                        router.push(url.pathname + url.search)
                      }}
                      className={`min-w-9 h-9 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-brand-navy text-white shadow-xs'
                          : 'bg-white text-brand-muted border border-brand-border hover:text-brand-navy hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })
              })()}

              {/* Next button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('page', String(Math.min(totalPages, currentPage + 1)))
                  router.push(url.pathname + url.search)
                }}
                className="px-3 py-2 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-brand-navy text-xs font-semibold border border-brand-border shadow-2xs transition-all flex items-center gap-1"
                title="Trang sau"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        title={lightboxState.title}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
