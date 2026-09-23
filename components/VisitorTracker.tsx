'use client'

import { useEffect } from 'react'
import { addAuditLog } from '@/lib/camera247-data'

interface VisitorTrackerProps {
  pageName?: string
  module?: string
}

export default function VisitorTracker({
  pageName = 'Trang chủ Landing Page',
  module = 'Landing Page',
}: VisitorTrackerProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Avoid logging multiple times in the same session within 5 minutes for the same page
    const sessionKey = `c247_visited_${pageName}`
    const lastVisit = sessionStorage.getItem(sessionKey)
    const now = Date.now()

    if (!lastVisit || now - parseInt(lastVisit, 10) > 5 * 60 * 1000) {
      sessionStorage.setItem(sessionKey, now.toString())
      try {
        addAuditLog(
          'visitor',
          'Khách xem Web',
          'Xem trang',
          module,
          `Khách truy cập xem ${pageName} qua trình duyệt web`
        )
      } catch {
        // ignore
      }
    }
  }, [pageName, module])

  return null
}
