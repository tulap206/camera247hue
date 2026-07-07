import Link from 'next/link'
import Image from 'next/image'
import { type Post } from '@/lib/supabase'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'

export default function ProjectsPreview({ posts }: { posts: Post[] }) {
  return (
    <section className="py-20 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#F5C518] text-sm font-medium mb-4 tracking-widest uppercase">
              <span className="w-8 h-px bg-[#F5C518]" />
              Công Trình Tiêu Biểu
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              DỰ ÁN ĐÃ THỰC HIỆN
            </h2>
          </div>
          <Link href="/cong-trinh"
            className="flex items-center gap-2 text-[#F5C518] hover:text-yellow-300 font-semibold transition-colors flex-shrink-0">
            Xem Tất Cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-400 text-lg mb-6">Các công trình sẽ được cập nhật sớm...</p>
            <Link href="/cong-trinh"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all">
              Xem Tất Cả Công Trình
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/cong-trinh/${post.slug}`}
                className="group block glass-panel rounded-[24px] overflow-hidden border border-white/5 hover:border-yellow-500/30 hover:-translate-y-1.5 hover:shadow-neon-gold transition-all duration-500">
                
                {/* Image */}
                <div className="aspect-video bg-black/60 relative overflow-hidden">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-white/5">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  {/* Category badge */}
                  {post.category && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#F5C518] to-amber-500 text-black text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      {post.category.name}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-extrabold text-white mb-2 text-lg line-clamp-2 group-hover:text-[#F5C518] transition-colors leading-tight font-heading uppercase tracking-wide">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed font-medium">{post.excerpt}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 font-semibold border-t border-white/5 pt-4">
                    {post.location && (
                      <span className="flex items-center gap-1.5 hover:text-[#F5C518] transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-[#F5C518]" /> {post.location}
                      </span>
                    )}
                    {post.completed_at && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F5C518]" />
                        {new Date(post.completed_at).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
