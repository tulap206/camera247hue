'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Phone,
  Camera,
  Share2,
  Check,
} from 'lucide-react'

export interface LightboxImage {
  src: string
  alt?: string
  caption?: string
}

interface ImageLightboxModalProps {
  isOpen: boolean
  images: (string | LightboxImage)[]
  initialIndex?: number
  title?: string
  onClose: () => void
}

export default function ImageLightboxModal({
  isOpen,
  images,
  initialIndex = 0,
  title,
  onClose,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Normalize images to LightboxImage objects
  const normalizedImages: LightboxImage[] = images.map((img) =>
    typeof img === 'string' ? { src: img, alt: title || 'Hình ảnh công trình' } : img
  )

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), normalizedImages.length - 1))
      setIsZoomed(false)
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialIndex, normalizedImages.length])

  const handlePrev = useCallback(() => {
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1))
  }, [normalizedImages.length])

  const handleNext = useCallback(() => {
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev < normalizedImages.length - 1 ? prev + 1 : 0))
  }, [normalizedImages.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePrev, handleNext, onClose])

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && normalizedImages.length > 1) {
      handleNext()
    } else if (isRightSwipe && normalizedImages.length > 1) {
      handlePrev()
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen || normalizedImages.length === 0) return null

  const currentImage = normalizedImages[currentIndex] || normalizedImages[0]

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl transition-all duration-300 animate-in fade-in select-none"
      onClick={onClose}
    >
      {/* Top Bar / Controls */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 bg-gradient-to-b from-black/80 to-transparent z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold truncate text-white/90">
              {title || currentImage.alt || 'Chi Tiết Hình Ảnh Công Trình'}
            </h4>
            <p className="text-[11px] text-white/60 font-mono">
              Ảnh {currentIndex + 1} / {normalizedImages.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/10 transition-all"
            title={isZoomed ? 'Thu nhỏ' : 'Phóng to'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          <button
            onClick={handleCopyLink}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/10 transition-all hidden sm:flex items-center gap-1.5 text-xs font-semibold"
            title="Sao chép liên kết"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>

          <a
            href="tel:0796785151"
            className="px-3 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold transition-all items-center gap-1.5 hidden sm:inline-flex shadow-lg shadow-blue-500/20"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>0796 785 151</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-white/15 hover:bg-rose-500/80 text-white border border-white/20 transition-all ml-1"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        onClick={(e) => {
          // If clicking background stage, close lightbox
          if (e.target === e.currentTarget) onClose()
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrow - Left */}
        {normalizedImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl"
            title="Ảnh trước (Phím mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Current Center Photo */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage.src}
            alt={currentImage.alt || title || `Hình ảnh ${currentIndex + 1}`}
            className={`max-w-[95vw] sm:max-w-[88vw] max-h-[75vh] sm:max-h-[80vh] object-contain rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-300 ${
              isZoomed ? 'scale-125 sm:scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>

        {/* Navigation Arrow - Right */}
        {normalizedImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl"
            title="Ảnh kế tiếp (Phím mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip & Caption */}
      <div
        className="w-full px-4 py-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 flex flex-col items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImage.caption && (
          <p className="text-xs text-white/80 font-medium text-center max-w-2xl px-4 truncate">
            {currentImage.caption}
          </p>
        )}

        {normalizedImages.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 scrollbar-none">
            {normalizedImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsZoomed(false)
                  setCurrentIndex(idx)
                }}
                className={`relative w-14 h-10 sm:w-18 sm:h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                  currentIndex === idx
                    ? 'border-[#0071E3] scale-105 shadow-md shadow-blue-500/30 opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-80 hover:border-white/40'
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
