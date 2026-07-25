import Link from "next/link"
import Image from "next/image"
import { type Post } from "@/lib/supabase"
import { MapPin, Calendar, ArrowRight, Camera } from "lucide-react"

export default function ProjectsPreview({ posts }: { posts: Post[] }) {
  return (
    <section className="bg-[#0d0d0d] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#F5C518]">Công trình tiêu biểu</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Dự án đã thực hiện
            </h2>
          </div>
          <Link
            href="/cong-trinh"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#F5C518] hover:text-[#FCDD60]"
          >
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <Camera className="mx-auto size-12 text-zinc-600" />
            <p className="mt-4 text-lg text-zinc-400">Các công trình sẽ được cập nhật sớm</p>
            <Link
              href="/cong-trinh"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-6 py-3 text-sm font-bold text-black"
            >
              Xem tất cả công trình
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/cong-trinh/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/5 bg-[#111115] transition-all hover:-translate-y-1 hover:border-[#F5C518]/30"
              >
                <div className="relative aspect-video overflow-hidden bg-black/60">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-zinc-600">
                      <Camera className="size-10" />
                    </div>
                  )}
                  {post.category ? (
                    <span className="absolute top-3 left-3 rounded-md bg-[#F5C518] px-2.5 py-1 text-[10px] font-bold tracking-wide text-black uppercase">
                      {post.category.name}
                    </span>
                  ) : null}
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-white transition-colors group-hover:text-[#F5C518]">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/5 pt-4 text-[11px] font-medium text-zinc-500">
                    {post.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-[#F5C518]" /> {post.location}
                      </span>
                    ) : null}
                    {post.completed_at ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-[#F5C518]" />
                        {new Date(post.completed_at).toLocaleDateString("vi-VN")}
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
