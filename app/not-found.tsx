import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-brand-bg flex items-center justify-center text-center px-4">
      <div>
        <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-brand-navy" />
        </div>
        <h1 className="font-heading text-6xl font-extrabold text-brand-navy mb-2">404</h1>
        <p className="text-brand-navy text-xl font-bold mb-2">Không tìm thấy trang</p>
        <p className="text-brand-muted mb-8">Trang bạn tìm kiếm không tồn tại.</p>
        <Link href="/" className="btn-accent">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
