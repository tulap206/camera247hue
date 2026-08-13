import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import { supabase } from '@/lib/supabase'
import { MapPin, Calendar, ChevronLeft, Building, Camera, Phone } from 'lucide-react'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase.from('posts').select('title, excerpt').eq('slug', params.slug).single()
  if (!data) return {}
  return {
    title: `${data.title} - Camera 247 Huế`,
    description: data.excerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase
    .from('posts')
    .select('*, category:categories(*)')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const { data: related } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image, location, category:categories(name)')
    .eq('published', true)
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .limit(3)

  return (
    <main>
      <Navbar />
      <div className="nav-offset">
        <div className="relative h-52 sm:h-96 bg-brand-navy overflow-hidden">
          {post.cover_image ? (
            <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-brand-navy flex items-center justify-center">
              <Building className="w-16 h-16 text-white/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-8 max-w-5xl mx-auto">
            {post.category && (
              <div className="inline-block bg-brand-yellow text-brand-navy text-xs font-bold px-3 py-1 rounded-md mb-3">
                {post.category.name}
              </div>
            )}
            <h1 className="font-heading text-xl sm:text-4xl font-extrabold text-white max-w-3xl tracking-tight leading-snug">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10 pb-24 sm:pb-10">
          <Link
            href="/cong-trinh"
            className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-navy transition-colors text-sm mb-8"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-brand-border">
                {post.location && (
                  <div className="flex items-center gap-2 text-brand-muted text-sm">
                    <MapPin className="w-4 h-4 text-brand-navy" />
                    {post.location}
                  </div>
                )}
                {post.completed_at && (
                  <div className="flex items-center gap-2 text-brand-muted text-sm">
                    <Calendar className="w-4 h-4 text-brand-navy" />
                    Hoàn thành: {new Date(post.completed_at).toLocaleDateString('vi-VN')}
                  </div>
                )}
                {post.client_name && (
                  <div className="flex items-center gap-2 text-brand-muted text-sm">
                    <Building className="w-4 h-4 text-brand-navy" />
                    Khách hàng: {post.client_name}
                  </div>
                )}
              </div>

              {post.content && <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />}

              {post.images && post.images.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-heading text-lg font-bold text-brand-navy mb-4">Hình ảnh công trình</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {post.images.map((img: string, i: number) => (
                      <div
                        key={i}
                        className="aspect-video relative rounded-xl overflow-hidden bg-brand-soft border border-brand-border"
                      >
                        <Image
                          src={img}
                          alt={`${post.title} - ảnh ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-brand-soft rounded-[20px] p-5 border border-brand-border">
                <h4 className="font-heading font-bold text-brand-navy mb-3">Cần tư vấn?</h4>
                <p className="text-brand-muted text-sm mb-4 leading-relaxed">
                  Liên hệ để được khảo sát và tư vấn giải pháp an ninh phù hợp nhu cầu của bạn.
                </p>
                <a href="tel:0967611112" className="btn-accent w-full !text-sm mb-2">
                  <Phone className="w-4 h-4" />
                  0967 611 112
                </a>
                <a
                  href="https://zalo.me/0967611112"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost w-full !text-sm"
                >
                  Zalo chat
                </a>
              </div>

              {related && related.length > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-brand-navy mb-3 text-sm">Công trình liên quan</h4>
                  <div className="space-y-3">
                    {related.map((r: { id: string; title: string; slug: string; cover_image?: string; location?: string }) => (
                      <Link
                        key={r.id}
                        href={`/cong-trinh/${r.slug}`}
                        className="group flex gap-3 p-3 bg-white rounded-xl border border-brand-border hover:shadow-soft transition-all"
                      >
                        <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-brand-soft shrink-0">
                          {r.cover_image ? (
                            <Image src={r.cover_image} alt={r.title} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Camera className="w-4 h-4 text-brand-muted/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-brand-navy text-xs font-semibold group-hover:text-[#16324A] transition-colors line-clamp-2">
                            {r.title}
                          </div>
                          {r.location && (
                            <div className="text-brand-muted text-xs mt-1 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> {r.location}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingContact />
    </main>
  )
}
