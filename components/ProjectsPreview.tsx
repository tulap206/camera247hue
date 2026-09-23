'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { type Post } from '@/lib/supabase'
import { MapPin, ArrowRight, Camera, Sparkles, ZoomIn } from 'lucide-react'
import Reveal from '@/components/Reveal'
import ImageLightboxModal from '@/components/ImageLightboxModal'

const fallbackProjects = [
  {
    id: 'demo-1',
    slug: 'lap-dat-32-camera-khach-san-huong-giang-hue',
    title: 'Lắp Đặt Hệ Thống 32 Camera Giám Sát Khách Sạn Hương Giang Huế',
    excerpt: 'Triển khai trọn gói 32 camera IP ColorVu có màu ban đêm, đầu ghi 32 kênh 4K và tủ mạng trung tâm cho Hương Giang Resort & Spa.',
    cover_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    category: { name: 'Camera Quan Sát' },
    location: '51 Lê Lợi, TP. Huế',
  },
  {
    id: 'demo-2',
    slug: 'lap-dat-khoa-van-tay-faceid-biet-thu-an-cuu-city-hue',
    title: 'Triển Khai Khóa Cửa Vân Tay Nhận Diện FaceID Biệt Thự An Cựu City',
    excerpt: 'Lắp đặt khóa FaceID 3D tích hợp chuông cửa màn hình Kaadas K20 Pro Max cho cửa chính gỗ lim biệt thự.',
    cover_image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    category: { name: 'Khóa Cửa Thông Minh' },
    location: 'KĐT An Cựu City, TP. Huế',
  },
  {
    id: 'demo-3',
    slug: 'thi-cong-wifi-chiu-tai-cafe-the-time-hung-vuong-hue',
    title: 'Thi Công Hệ Thống Mạng Wifi Mesh Chịu Tải Quán Cafe The Time Hùng Vương',
    excerpt: 'Nâng cấp toàn diện mạng Wifi 6 chịu tải 200+ user với Router DrayTek cân bằng tải và 4 bộ phát Ruijie Mesh.',
    cover_image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    category: { name: 'Mạng Wifi Chuyên Dụng' },
    location: '18 Hùng Vương, TP. Huế',
  },
]

export default function ProjectsPreview({ posts }: { posts: Post[] }) {
  const displayPosts = posts && posts.length > 0 ? posts : fallbackProjects
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean
    images: string[]
    title: string
    initialIndex: number
  }>({
    isOpen: false,
    images: [],
    title: '',
    initialIndex: 0,
  })

  const handleOpenZoom = (e: React.MouseEvent, post: any) => {
    e.preventDefault()
    e.stopPropagation()
    const imgs: string[] = []
    if (post.cover_image) imgs.push(post.cover_image)
    if (Array.isArray(post.images)) {
      post.images.forEach((im: string) => {
        if (im && !imgs.includes(im)) imgs.push(im)
      })
    }
    if (imgs.length > 0) {
      setLightboxState({
        isOpen: true,
        images: imgs,
        title: post.title,
        initialIndex: 0,
      })
    }
  }

  return (
    <section className="section-y bg-white border-b border-brand-border">
      <div className="container-page">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-brand-navy text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow-dark" />
              Dự án thực tế
            </div>
            <h2 className="font-heading text-[1.75rem] sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
              Công trình tiêu biểu đã thực hiện
            </h2>
            <p className="text-brand-muted leading-relaxed text-sm sm:text-base">
              Hình ảnh thi công thực tế tại các công trình nhà phố, biệt thự, nhà hàng, khách sạn và văn phòng tại TP. Huế.
            </p>
          </div>
          <Link
            href="/cong-trinh"
            className="inline-flex items-center gap-2 text-brand-navy font-bold text-sm hover:text-brand-yellow-dark transition-all duration-300 ease-out shrink-0 min-h-[44px]"
          >
            <span>Xem tất cả công trình</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayPosts.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.05}>
              <div className="group block rounded-2xl overflow-hidden bg-white border border-brand-border shadow-soft hover:border-brand-yellow hover:shadow-lift transition-all duration-300 ease-out h-full flex flex-col justify-between">
                <div>
                  <div className="aspect-[16/10] bg-brand-soft relative overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-brand-muted/40" />
                      </div>
                    )}

                    {/* Category Badge */}
                    {post.category && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-brand-navy text-[11px] font-bold px-3 py-1 rounded-full border border-brand-border/60 shadow-sm z-10">
                        {post.category.name}
                      </div>
                    )}

                    {/* Direct Quick Zoom Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenZoom(e, post)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 z-10 shadow-md"
                      title="Phóng to ảnh công trình"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Dark gradient on bottom of image with zoom prompt */}
                    <div
                      onClick={(e) => handleOpenZoom(e, post)}
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-brand-navy text-xs font-bold shadow-md">
                        <ZoomIn className="w-3.5 h-3.5 text-brand-navy" />
                        Phóng to ảnh
                      </span>
                    </div>
                  </div>

                  <Link href={`/cong-trinh/${post.slug}`} className="block p-5 sm:p-6">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-2 line-clamp-2 group-hover:text-brand-yellow-dark transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-brand-muted text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                </div>

                <div className="px-5 sm:px-6 pb-5 pt-0 mt-auto">
                  <div className="pt-3.5 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-muted">
                    {post.location ? (
                      <div className="flex items-center gap-1.5 font-medium text-brand-navy">
                        <MapPin className="w-3.5 h-3.5 text-brand-yellow-dark shrink-0" />
                        <span>{post.location}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-medium text-brand-navy">
                        <MapPin className="w-3.5 h-3.5 text-brand-yellow-dark shrink-0" />
                        <span>TP. Huế</span>
                      </div>
                    )}
                    <Link
                      href={`/cong-trinh/${post.slug}`}
                      className="text-[11px] font-semibold text-brand-yellow-dark hover:underline flex items-center gap-1"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Landing Page Image Lightbox */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        title={lightboxState.title}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
      />
    </section>
  )
}
