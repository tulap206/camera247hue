'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, type Post, type Category } from '@/lib/supabase'
import { MapPin, Calendar, ArrowRight, Search, Camera } from 'lucide-react'

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

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line
  }, [activeCategory, currentPage])

  async function fetchPosts() {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('published', true)
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

    const { data, count } = await query
    setPosts(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const handleCategoryChange = (slug?: string) => {
    const url = slug ? `/cong-trinh?category=${slug}` : '/cong-trinh'
    router.push(url)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="bg-brand-bg min-h-[50vh]">
      <div className="container-page py-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory
                  ? 'bg-brand-navy text-white'
                  : 'bg-white text-brand-muted border border-brand-border hover:text-brand-navy'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-brand-navy text-white'
                    : 'bg-white text-brand-muted border border-brand-border hover:text-brand-navy'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-brand-muted text-sm mb-6">
          {loading ? 'Đang tải...' : `${total} công trình${activeCategory ? ' trong mục này' : ''}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/cong-trinh/${post.slug}`}
                className="group block bg-white rounded-[20px] overflow-hidden border border-brand-border hover:shadow-lift transition-all duration-300 ease-out"
              >
                <div className="aspect-[16/10] bg-brand-soft relative overflow-hidden">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-brand-muted/40" />
                    </div>
                  )}
                  {post.category && (
                    <div className="absolute top-3 left-3 bg-white/95 text-brand-navy text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      {post.category.name}
                    </div>
                  )}
                  {post.featured && (
                    <div className="absolute top-3 right-3 bg-brand-yellow text-brand-navy text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      Nổi bật
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-heading font-bold text-brand-navy mb-2 line-clamp-2 group-hover:text-[#16324A] transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-brand-muted text-sm mb-3 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-brand-muted flex-wrap">
                      {post.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {post.location}
                        </span>
                      )}
                      {post.completed_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.completed_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-navy opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('page', String(page))
                  router.push(url.pathname + url.search)
                }}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                  page === currentPage
                    ? 'bg-brand-navy text-white'
                    : 'bg-white text-brand-muted border border-brand-border hover:text-brand-navy'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
