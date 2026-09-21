import Link from 'next/link'
import Image from 'next/image'
import { type Post } from '@/lib/supabase'
import { MapPin, ArrowRight, Camera, Sparkles } from 'lucide-react'
import Reveal from '@/components/Reveal'

const fallbackProjects = [
  {
    id: 'demo-1',
    slug: 'lap-dat-camera-ai-biet-thu-vy-da',
    title: 'Hệ thống 8 Camera AI 4K Full Color cho Biệt thự Vỹ Dạ',
    excerpt: 'Thi công giấu dây âm tường 100%, tích hợp camera màu ban đêm 24/7 và hàng rào điện tử cảnh báo còi hú.',
    cover_image: '/images/services/camera-cctv.jpg',
    category: { name: 'Camera biệt thự' },
    location: 'Vỹ Dạ, TP. Huế',
  },
  {
    id: 'demo-2',
    slug: 'khoa-cua-thong-minh-faceid-nha-pho',
    title: 'Khóa cửa thông minh FaceID 3D & Camera an ninh Nhà phố',
    excerpt: 'Lắp đặt khóa thông minh mở khóa nhận diện khuôn mặt kết hợp hệ thống camera giám sát từ xa qua điện thoại.',
    cover_image: '/images/services/smart-door-lock.jpg',
    category: { name: 'Khóa cửa & An ninh' },
    location: 'Phan Chu Trinh, TP. Huế',
  },
  {
    id: 'demo-3',
    slug: 'he-thong-wifi-mesh-camera-cafe-nha-hang',
    title: 'Hạ tầng mạng Wifi Mesh Roaming & Camera Chuỗi Nhà hàng',
    excerpt: 'Phủ sóng Wifi 6 tốc độ cao chịu tải 150+ khách đồng thời và hệ thống camera quản lý quầy thu ngân sắc nét.',
    cover_image: '/images/services/wifi-network.jpg',
    category: { name: 'Mạng Wifi & Quản lý' },
    location: 'Hùng Vương, TP. Huế',
  },
]

export default function ProjectsPreview({ posts }: { posts: Post[] }) {
  const displayPosts = posts && posts.length > 0 ? posts : fallbackProjects

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
              <Link
                href={`/cong-trinh/${post.slug}`}
                className="group block rounded-2xl overflow-hidden bg-white border border-brand-border shadow-soft hover:border-brand-yellow hover:shadow-lift transition-all duration-300 ease-out h-full flex flex-col justify-between"
              >
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
                    {post.category && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-brand-navy text-[11px] font-bold px-3 py-1 rounded-full border border-brand-border/60 shadow-sm">
                        {post.category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-2 line-clamp-2 group-hover:text-brand-navy transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-brand-muted text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
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
                    <span className="text-[11px] font-semibold text-brand-yellow-dark group-hover:underline">Chi tiết →</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
