import Link from 'next/link'
import Image from 'next/image'
import { type Post } from '@/lib/supabase'
import { MapPin, Calendar, ArrowRight, Camera } from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function ProjectsPreview({ posts }: { posts: Post[] }) {
  return (
    <section className="py-20 sm:py-24 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2
              style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              DỰ ÁN ĐÃ THỰC HIỆN
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md">
              Một số công trình tiêu biểu tại Huế và vùng lân cận.
            </p>
          </div>
          <Link
            href="/cong-trinh"
            className="inline-flex items-center gap-2 text-[#F5C518] hover:text-[#FFD84D] font-semibold transition-colors shrink-0"
          >
            Xem Tất Cả <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal className="text-center py-16 surface-card">
            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-6">Các công trình sẽ được cập nhật sớm.</p>
            <Link href="/cong-trinh" className="btn-primary px-6 py-3 rounded-xl text-sm">
              Xem Công Trình
            </Link>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.05}>
                <Link
                  href={`/cong-trinh/${post.slug}`}
                  className="group block surface-card overflow-hidden hover:-translate-y-0.5"
                >
                  <div className="aspect-video bg-[#111] relative overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                        <Camera className="w-10 h-10 opacity-40" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3 bg-[#F5C518] text-black text-[11px] font-bold px-2.5 py-1 rounded-md">
                        {post.category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3
                      className="font-bold text-white mb-2 line-clamp-2 group-hover:text-[#F5C518] transition-colors"
                      style={{ fontFamily: 'Oswald, sans-serif' }}
                    >
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
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
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
