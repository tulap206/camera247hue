import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import { supabase, type Post } from '@/lib/supabase'
import { SAMPLE_POSTS } from '@/lib/camera247-data'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { MapPin, Calendar, ChevronLeft, Building, Camera, Phone } from 'lucide-react'
import ProjectHeroBanner from '@/components/ProjectHeroBanner'
import ProjectImageGallery from '@/components/ProjectImageGallery'
import VisitorTracker from '@/components/VisitorTracker'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }) {
  let postTitle = ''
  let postExcerpt = ''
  try {
    const { data } = await supabase.from('posts').select('title, excerpt').eq('slug', params.slug).single()
    if (data) {
      postTitle = data.title
      postExcerpt = data.excerpt
    }
  } catch {
    // fallback
  }

  if (!postTitle) {
    const fallback = SAMPLE_POSTS.find((p) => p.slug === params.slug)
    if (fallback) {
      postTitle = fallback.title
      postExcerpt = fallback.excerpt
    }
  }

  if (!postTitle) return {}
  return {
    title: `${postTitle} - Camera 247 Huế`,
    description: postExcerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  let post: any = null
  try {
    const { data } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('slug', params.slug)
      .eq('published', true)
      .single()
    post = data
  } catch {
    // ignore
  }

  if (!post) {
    post = SAMPLE_POSTS.find((p) => p.slug === params.slug)
  }

  if (!post) notFound()

  let related: any[] = []
  try {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, cover_image, location, category:categories(name)')
      .eq('published', true)
      .eq('category_id', post.category_id)
      .neq('id', post.id)
      .limit(3)
    if (data) related = data
  } catch {
    // ignore
  }

  if (related.length === 0) {
    related = SAMPLE_POSTS.filter((p) => p.id !== post.id && p.category_id === post.category_id).slice(0, 3)
    if (related.length === 0) {
      related = SAMPLE_POSTS.filter((p) => p.id !== post.id).slice(0, 3)
    }
  }

  const categoryName = post.category?.name || 'Công Trình Thực Tế'

  return (
    <main>
      <VisitorTracker pageName={`Công trình: ${post.title}`} module="Landing Page" />
      <Navbar />
      <div className="nav-offset">
        {/* Interactive Hero Banner with Lightbox Zoom */}
        <ProjectHeroBanner
          coverImage={post.cover_image}
          images={post.images}
          title={post.title}
          categoryName={categoryName}
        />

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

              {/* Interactive Image Gallery & Article HTML Content with image zoom popup */}
              <ProjectImageGallery
                coverImage={post.cover_image}
                images={post.images}
                title={post.title}
                contentHtml={post.content ? sanitizeHtml(post.content) : undefined}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-brand-soft rounded-[20px] p-5 border border-brand-border">
                <h4 className="font-heading font-bold text-brand-navy mb-3">Cần tư vấn?</h4>
                <p className="text-brand-muted text-sm mb-4 leading-relaxed">
                  Liên hệ để được khảo sát và tư vấn giải pháp an ninh phù hợp nhu cầu của bạn.
                </p>
                <a href="tel:0796785151" className="btn-accent w-full !text-sm mb-2">
                  <Phone className="w-4 h-4" />
                  0796 785 151 (Tước - Kỹ thuật)
                </a>
                <a
                  href="https://zalo.me/0796785151"
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
                    {related.map((r: any) => (
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
