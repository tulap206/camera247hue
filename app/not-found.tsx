import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-center px-4">
      <div>
        <div className="w-20 h-20 bg-[#F5C518]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#F5C518]/20">
          <Shield className="w-10 h-10 text-[#F5C518]" />
        </div>
        <h1 style={{ fontFamily: 'Oswald, sans-serif' }}
          className="text-6xl font-bold text-[#F5C518] mb-2">404</h1>
        <p className="text-white text-xl font-bold mb-2">Không tìm thấy trang</p>
        <p className="text-gray-400 mb-8">Trang bạn tìm kiếm không tồn tại.</p>
        <Link href="/"
          className="bg-[#F5C518] text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all">
          Về Trang Chủ
        </Link>
      </div>
    </div>
  )
}
