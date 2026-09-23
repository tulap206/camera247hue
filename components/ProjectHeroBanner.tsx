'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Building, ZoomIn, Camera } from 'lucide-react'
import ImageLightboxModal from '@/components/ImageLightboxModal'

interface ProjectHeroBannerProps {
  coverImage?: string
  images?: string[]
  title: string
  categoryName?: string
}

export default function ProjectHeroBanner({
  coverImage,
  images = [],
  title,
  categoryName,
}: ProjectHeroBannerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const allImages: string[] = []
  if (coverImage) allImages.push(coverImage)
  if (Array.isArray(images)) {
    images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img)
    })
  }

  return (
    <>
      <div
        onClick={() => {
          if (allImages.length > 0) setLightboxOpen(true)
        }}
        className="relative h-60 sm:h-96 bg-brand-navy overflow-hidden cursor-pointer group select-none"
        title="Nhấn để phóng to xem ảnh kích thước đầy đủ"
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-navy flex items-center justify-center">
            <Building className="w-16 h-16 text-white/15" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-black/30 group-hover:via-brand-navy/50 transition-colors duration-300" />

        {/* Top Right Quick Zoom Badge */}
        {allImages.length > 0 && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-md border border-white/20 text-xs font-bold shadow-lg transition-all transform group-hover:scale-105">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Phóng to ảnh ({allImages.length})</span>
            </div>
          </div>
        )}

        {/* Bottom Banner Title */}
        <div className="absolute bottom-6 left-0 right-0 px-5 sm:px-8 max-w-5xl mx-auto z-10">
          {categoryName && (
            <div className="inline-block bg-brand-yellow text-brand-navy text-xs font-bold px-3 py-1 rounded-md mb-3 shadow-sm">
              {categoryName}
            </div>
          )}
          <h1 className="font-heading text-xl sm:text-4xl font-extrabold text-white max-w-3xl tracking-tight leading-snug drop-shadow-sm">
            {title}
          </h1>
        </div>
      </div>

      {/* Lightbox for Hero Banner */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        images={allImages}
        initialIndex={0}
        title={title}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
