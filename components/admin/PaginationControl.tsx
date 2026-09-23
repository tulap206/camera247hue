'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationControlProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  itemLabel?: string // e.g. "công trình", "khách hàng", "đơn hàng", "bản ghi"
  onPageChange: (page: number) => void
  className?: string
  scrollToTopSelector?: string
}

export default function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemLabel = 'mục',
  onPageChange,
  className,
  scrollToTopSelector,
}: PaginationControlProps) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    return null
  }

  const startIdx = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    onPageChange(page)

    if (scrollToTopSelector && typeof window !== 'undefined') {
      const el = document.querySelector(scrollToTopSelector)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Generate page numbers with ellipses
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ]
  }

  const pages = getPageNumbers()

  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#86868B]',
        className
      )}
    >
      {/* Summary Info */}
      <div className="flex items-center gap-1.5 text-center md:text-left">
        <span>
          Hiển thị <strong className="text-[#1D1D1F] font-semibold">{totalItems > 0 ? `${startIdx} - ${endIdx}` : 0}</strong> trong{' '}
          <strong className="text-[#1D1D1F] font-semibold">{totalItems}</strong> {itemLabel}
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="hidden sm:inline text-slate-500 font-medium">
          Trang <strong className="text-[#1D1D1F]">{currentPage}</strong> / {totalPages}
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
        {/* First Page Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(1)}
          title="Trang đầu"
          aria-label="Trang đầu"
          className="p-1.5 sm:px-2 sm:py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-700 font-medium border border-slate-200/80 transition-all flex items-center gap-1"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Đầu</span>
        </button>

        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
          title="Trang trước"
          aria-label="Trang trước"
          className="px-2.5 sm:px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-700 font-medium border border-slate-200/80 transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-[11px]">Trước</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 mx-0.5 sm:mx-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 font-bold select-none text-xs"
                >
                  •••
                </span>
              )
            }

            const pageNum = p as number
            const isActive = pageNum === currentPage

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => handlePageClick(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'min-w-7 h-7 sm:min-w-8 sm:h-8 px-1.5 sm:px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center',
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-xs ring-2 ring-blue-500/25 border border-[#0071E3]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300 shadow-2xs'
                )}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          title="Trang sau"
          aria-label="Trang sau"
          className="px-2.5 sm:px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-700 font-medium border border-slate-200/80 transition-all flex items-center gap-1"
        >
          <span className="text-[11px]">Sau</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(totalPages)}
          title="Trang cuối"
          aria-label="Trang cuối"
          className="p-1.5 sm:px-2 sm:py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-700 font-medium border border-slate-200/80 transition-all flex items-center gap-1"
        >
          <span className="hidden lg:inline text-[11px]">Cuối</span>
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
