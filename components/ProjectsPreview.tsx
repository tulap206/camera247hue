import Link from 'next/link'
import Image from 'next/image'
import { type Post } from '@/lib/supabase'
import { MapPin, Calendar, Camera, ArrowUpRight } from 'lucide-react'

export default function ProjectsPreview({ posts }: { posts: Post[] }) {
  return (
    <section className="bg-[#050505] py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]"></span>
              <span className="text-zinc-400 text-[10px] tracking-[0.2em] font-extrabold uppercase">Thực Tế</span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white leading-none tracking-tight">
              CÔNG TRÌNH TIÊU BIỂU
            </h2>
          </div>
          <Link
            href="/cong-trinh"
            className="group inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-5 py-2.5 rounded-full font-bold text-[10px] tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            <span>Tất cả dự án</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2.5} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 py-20 text-center bg-white/[0.01]">
            <Camera className="mx-auto w-10 h-10 text-zinc-600" strokeWidth={1.5} />
            <p className="mt-4 text-sm text-zinc-400 font-medium">Hình ảnh công trình thực tế đang được cập nhật</p>
            <Link
              href="/cong-trinh"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-6 py-3 text-xs font-bold uppercase tracking-wider text-black"
            >
              Xem danh sách công trình
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/cong-trinh/${post.slug}`}
                className="group block p-1.5 bg-white/[0.01] border border-white/5 rounded-[2.2rem] hover:border-[#F5C518]/25 hover:-translate-y-1 transition-all duration-500 shadow-lg"
              >
                {/* Image wrap (Double Bezel inside the card) */}
                <div className="relative aspect-video overflow-hidden rounded-[calc(2.2rem-0.375rem)] bg-black">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-80"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-zinc-700">
                      <Camera className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                  )}
                  {post.category ? (
                    <span className="absolute top-4 left-4 rounded-full bg-[#F5C518] px-3.5 py-1 text-[9px] font-bold tracking-widest text-black uppercase">
                      {post.category.name}
                    </span>
                  ) : null}
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="line-clamp-2 font-heading text-lg font-black leading-snug text-white transition-colors group-hover:text-[#F5C518] uppercase">
                    {post.title}
                  </h3>
                  
                  {post.excerpt ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 font-medium">
                      {post.excerpt}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {post.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#F5C518]" strokeWidth={1.5} />
                        <span>{post.location}</span>
                      </span>
                    ) : null}
                    {post.completed_at ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F5C518]" strokeWidth={1.5} />
                        <span>{new Date(post.completed_at).toLocaleDateString("vi-VN")}</span>
                      </span>
                    ) : null}
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
