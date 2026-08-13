'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'
import { SITE_IMAGES } from '@/lib/siteImages'

export default function LoginView() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth', { credentials: 'same-origin' })
      .then((res) => {
        if (res.ok) router.replace('/admin')
      })
      .catch(() => {})
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.replace('/admin')
        return
      }
      if (res.status === 429) {
        setError('Thử lại sau vài phút.')
        return
      }
      setError('Mật khẩu không đúng. Vui lòng thử lại.')
    } catch {
      setError('Không kết nối được. Vui lòng thử lại.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[100svh] bg-brand-bg flex flex-col lg:flex-row">
      <aside className="relative hidden lg:flex lg:w-[46%] min-h-[100svh] bg-brand-navy overflow-hidden">
        <Image
          src={SITE_IMAGES.hero.src}
          alt={SITE_IMAGES.hero.alt}
          fill
          priority
          className="object-cover object-[40%_center] lg:object-[28%_center]"
          sizes="46vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07131F] via-[#0B1F33]/70 to-[#07131F]/35" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-navy" strokeWidth={2.25} />
            </div>
            <div>
              <div className="font-heading font-extrabold text-[17px] leading-none">Camera 247</div>
              <div className="text-[11px] text-white/70 mt-0.5">Giải pháp an ninh Huế</div>
            </div>
          </Link>

          <div>
            <p className="font-heading font-extrabold text-brand-yellow text-lg mb-3">Khu vực quản trị</p>
            <h1 className="font-heading text-4xl xl:text-[2.75rem] font-extrabold tracking-tight leading-[1.12] max-w-[16ch] mb-4">
              Quản lý công trình và liên hệ khách hàng
            </h1>
            <p className="text-white/75 text-[15px] leading-relaxed max-w-[36ch]">
              Dành cho nhân sự Camera 247 Huế. Nội dung sau đăng nhập không hiển thị trên trang công khai.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-[100svh]">
        <div className="lg:hidden flex items-center justify-between px-5 h-14 border-b border-brand-border bg-white">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-navy" strokeWidth={2.25} />
            </div>
            <span className="font-heading font-extrabold text-brand-navy">Camera 247</span>
          </Link>
          <Link href="/" className="text-sm text-brand-muted font-medium">
            Trang chủ
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-navy mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </Link>

            <h2 className="font-heading text-[1.65rem] sm:text-3xl font-extrabold tracking-tight text-brand-navy mb-2">
              Đăng nhập
            </h2>
            <p className="text-brand-muted text-[15px] mb-8 leading-relaxed">
              Nhập mật khẩu quản trị để vào bảng điều khiển.
            </p>

            <form onSubmit={handleLogin} className="rounded-2xl sm:rounded-[20px] bg-white border border-brand-border p-5 sm:p-7 shadow-soft">
              <label className="block text-brand-muted text-xs mb-1.5 font-medium">Mật khẩu</label>
              <div className="relative mb-4">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="Nhập mật khẩu"
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-navy"
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-60">
                {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="text-brand-muted/80 text-xs mt-8">
              © {new Date().getFullYear()} Camera 247 Huế
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
