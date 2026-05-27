'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, type Post, type Category } from '@/lib/supabase'
import { MapPin, Calendar, ArrowRight, Search, Filter } from 'lucide-react'

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
      const cat = categories.find(c => c.slug === activeCategory)
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
    <div className="bg-[#0D0D0D] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm công trình..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPosts()}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory
                  ? 'bg-[#F5C518] text-black'
                  : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-[#F5C518] text-black'
                    : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results info */}
        <div className="text-gray-500 text-sm mb-6">
          {loading ? 'Đang tải...' : `${total} công trình${activeCategory ? ` trong mục này` : ''}`}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-400 text-lg">Chưa có công trình nào trong mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/cong-trinh/${post.slug}`}
                className="group block bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#F5C518]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/5"
              >
                {/* Image */}
                <div className="aspect-video bg-[#111] relative overflow-hidden">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 gap-2">
                      <span className="text-4xl">📷</span>
                      <span className="text-xs">Camera 247 Huế</span>
                    </div>
                  )}
                  {post.category && (
                    <div className="absolute top-3 left-3 bg-[#F5C518] text-black text-xs font-bold px-2.5 py-1 rounded-full">
                      {post.category.name}
                    </div>
                  )}
                  {post.featured && (
                    <div className="absolute top-3 right-3 bg-black/60 text-[#F5C518] text-xs font-bold px-2 py-0.5 rounded-full border border-[#F5C518]/50">
                      ⭐ Nổi bật
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-[#F5C518] transition-colors text-base"
                    style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
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
                    <ArrowRight className="w-4 h-4 text-[#F5C518] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('page', String(page))
                  router.push(url.pathname + url.search)
                }}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'bg-[#F5C518] text-black'
                    : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-gray-700'
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
