import Link from 'next/link'
import Image from 'next/image'
import { type Post } from '@/lib/supabase'
import { MapPin, ArrowRight, Camera } from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function ProjectsPreview({ posts }: { posts: Post[] }) {
  return (
    <section className="py-24 sm:py-28 bg-brand-soft">
      <div className="container-page">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
              Công trình đã thực hiện
            </h2>
            <p className="text-brand-muted leading-relaxed">
              Một số dự án tiêu biểu Camera 247 Huế đã triển khai tại thành phố và vùng lân cận.
            </p>
          </div>
          <Link
            href="/cong-trinh"
            className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm hover:gap-3 transition-all duration-300 ease-out shrink-0"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal className="rounded-[24px] bg-white border border-brand-border py-16 text-center">
            <Camera className="w-10 h-10 text-brand-muted/50 mx-auto mb-4" />
            <p className="text-brand-muted mb-6">Các công trình sẽ được cập nhật sớm.</p>
            <Link href="/cong-trinh" className="btn-primary !text-sm">
              Xem công trình
            </Link>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.05}>
                <Link
                  href={`/cong-trinh/${post.slug}`}
                  className="group block rounded-[20px] overflow-hidden bg-white border border-brand-border hover:shadow-lift transition-all duration-300 ease-out"
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
                  </div>

                  <div className="p-5">
                    <h3 className="font-heading font-bold text-brand-navy mb-2 line-clamp-2 group-hover:text-[#16324A] transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-brand-muted text-sm mb-3 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                    {post.location && (
                      <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                        <MapPin className="w-3.5 h-3.5" />
                        {post.location}
                      </div>
                    )}
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
