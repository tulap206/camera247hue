import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import { supabase } from '@/lib/supabase'
import { MapPin, Calendar, ChevronLeft, Building } from 'lucide-react'

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

  // Get related posts
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
      <div className="pt-20">
        {/* Hero */}
        <div className="relative h-64 sm:h-96 bg-[#111] overflow-hidden">
          {post.cover_image ? (
            <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1200] to-[#111] flex items-center justify-center">
              <Building className="w-20 h-20 text-[#F5C518]/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/50 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-8 max-w-5xl mx-auto">
            {post.category && (
              <div className="inline-block bg-[#F5C518] text-black text-xs font-bold px-3 py-1 rounded-full mb-3">
                {post.category.name}
              </div>
            )}
            <h1 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-2xl sm:text-4xl font-bold text-white max-w-3xl">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Content area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          {/* Back */}
          <Link href="/cong-trinh"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#F5C518] transition-colors text-sm mb-8">
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-800">
                {post.location && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 text-[#F5C518]" />
                    {post.location}
                  </div>
                )}
                {post.completed_at && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 text-[#F5C518]" />
                    Hoàn thành: {new Date(post.completed_at).toLocaleDateString('vi-VN')}
                  </div>
                )}
                {post.client_name && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Building className="w-4 h-4 text-[#F5C518]" />
                    Khách hàng: {post.client_name}
                  </div>
                )}
              </div>

              {/* Post content */}
              {post.content && (
                <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
              )}

              {/* Image gallery */}
              {post.images && post.images.length > 0 && (
                <div className="mt-8">
                  <h3 style={{ fontFamily: 'Oswald, sans-serif' }}
                    className="text-lg font-bold text-white mb-4">Hình Ảnh Công Trình</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {post.images.map((img: string, i: number) => (
                      <div key={i} className="aspect-video relative rounded-xl overflow-hidden bg-[#1A1A1A] border border-gray-800">
                        <Image src={img} alt={`${post.title} - ảnh ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA card */}
              <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#F5C518]/20">
                <h4 style={{ fontFamily: 'Oswald, sans-serif' }}
                  className="text-white font-bold mb-3">CẦN TƯ VẤN?</h4>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Liên hệ ngay để được tư vấn miễn phí về giải pháp an ninh phù hợp với nhu cầu của bạn.
                </p>
                <a href="tel:0967611112"
                  className="block w-full bg-[#F5C518] text-black text-center py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all text-sm">
                  📞 0967 611 112
                </a>
                <a href="https://zalo.me/0967611112" target="_blank" rel="noopener noreferrer"
                  className="block w-full mt-2 bg-[#0068FF] text-white text-center py-3 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm">
                  💬 Zalo Chat
                </a>
              </div>

              {/* Related */}
              {related && related.length > 0 && (
                <div>
                  <h4 style={{ fontFamily: 'Oswald, sans-serif' }}
                    className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Công Trình Liên Quan</h4>
                  <div className="space-y-3">
                    {related.map((r: any) => (
                      <Link key={r.id} href={`/cong-trinh/${r.slug}`}
                        className="group flex gap-3 p-3 bg-[#1A1A1A] rounded-xl border border-gray-800 hover:border-[#F5C518]/30 transition-all">
                        <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-[#111] flex-shrink-0">
                          {r.cover_image ? (
                            <Image src={r.cover_image} alt={r.title} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-700 text-lg">📷</div>
                          )}
                        </div>
                        <div>
                          <div className="text-white text-xs font-medium group-hover:text-[#F5C518] transition-colors line-clamp-2">
                            {r.title}
                          </div>
                          {r.location && (
                            <div className="text-gray-600 text-xs mt-1 flex items-center gap-1">
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
