'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ZoomIn, Camera, Layers } from 'lucide-react'
import ImageLightboxModal from '@/components/ImageLightboxModal'

interface ProjectImageGalleryProps {
  coverImage?: string
  images?: string[]
  title: string
  contentHtml?: string
}

export default function ProjectImageGallery({
  coverImage,
  images = [],
  title,
  contentHtml,
}: ProjectImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // Aggregate all unique images: cover image first, then gallery images
  const allImages: string[] = []
  if (coverImage) allImages.push(coverImage)
  if (Array.isArray(images)) {
    images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img)
    })
  }

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index)
    setLightboxOpen(true)
  }

  // Intercept any <img> clicks within article markdown content
  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const handleImgClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName.toLowerCase() === 'img') {
        const src = (target as HTMLImageElement).src
        if (src) {
          const foundIdx = allImages.findIndex((img) => img === src || src.includes(img))
          if (foundIdx >= 0) {
            openLightbox(foundIdx)
          } else {
            // Append and open
            allImages.push(src)
            openLightbox(allImages.length - 1)
          }
        }
      }
    }

    container.addEventListener('click', handleImgClick)
    return () => container.removeEventListener('click', handleImgClick)
  }, [allImages])

  return (
    <div className="space-y-8">
      {/* Article HTML Content with image click support */}
      {contentHtml && (
        <div
          ref={contentRef}
          className="prose prose-slate max-w-none text-[#1D1D1F] leading-relaxed [&_img]:rounded-2xl [&_img]:cursor-zoom-in [&_img]:shadow-md [&_img:hover]:opacity-95 [&_img]:transition-all [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:text-brand-navy [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-brand-navy [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {/* Gallery Grid Section */}
      {allImages.length > 0 && (
        <div className="pt-6 border-t border-brand-border/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-extrabold text-brand-navy flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-navy" />
              <span>Hình ảnh thi công thực tế ({allImages.length})</span>
            </h3>
            <span className="text-xs text-brand-muted font-medium">
              Nhấn vào ảnh để phóng to chi tiết
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {allImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-video rounded-2xl overflow-hidden bg-brand-soft border border-brand-border/80 cursor-pointer shadow-2xs hover:shadow-md hover:border-brand-navy/40 transition-all duration-300"
              >
                <Image
                  src={img}
                  alt={`${title} - ảnh ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-1 backdrop-blur-2xs">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wide drop-shadow-sm">
                    Phóng to ảnh {idx + 1}
                  </span>
                </div>

                {/* Cover badge on first image */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-brand-navy/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm border border-white/20">
                    Ảnh đại diện
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        images={allImages}
        initialIndex={activePhotoIndex}
        title={title}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
