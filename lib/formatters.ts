/**
 * Format utilities for Camera247 Huế
 */

export function formatVND(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0 đ'
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) || 0 : amount
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' đ'
}

export function formatNumber(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0'
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) || 0 : amount
  return new Intl.NumberFormat('vi-VN').format(Math.round(num))
}

export function parseVND(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const clean = value.replace(/[^\d]/g, '')
  return clean ? parseInt(clean, 10) : 0
}

export function formatDateVN(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    if (isNaN(d.getTime())) {
      // Check if it's DD/MM/YYYY
      if (typeof dateStr === 'string' && dateStr.includes('/')) return dateStr
      return '—'
    }
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return '—'
  }
}

export function formatDateTimeVN(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    if (isNaN(d.getTime())) return '—'
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${hours}:${minutes} ${day}/${month}/${year}`
  } catch {
    return '—'
  }
}

export function calculateWarrantyEnd(startDate: string, warrantyMonths: number): string {
  try {
    const parts = startDate.split(/[-/]/)
    let d: Date
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      } else {
        // DD/MM/YYYY
        d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))
      }
    } else {
      d = new Date(startDate)
    }

    if (isNaN(d.getTime())) return ''
    d.setMonth(d.getMonth() + warrantyMonths)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return ''
  }
}

export function isWarrantyActive(warrantyUntil: string | null | undefined): { active: boolean; remainingDays: number } {
  if (!warrantyUntil) return { active: false, remainingDays: 0 }
  try {
    let endDate: Date
    const parts = warrantyUntil.split(/[-/]/)
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        endDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      } else {
        endDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))
      }
    } else {
      endDate = new Date(warrantyUntil)
    }
    
    if (isNaN(endDate.getTime())) return { active: false, remainingDays: 0 }
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      active: diffDays >= 0,
      remainingDays: Math.max(0, diffDays)
    }
  } catch {
    return { active: false, remainingDays: 0 }
  }
}
