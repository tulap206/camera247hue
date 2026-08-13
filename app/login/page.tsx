import type { Metadata } from 'next'
import LoginView from '@/components/LoginView'

export const metadata: Metadata = {
  title: 'Đăng nhập quản trị - Camera 247 Huế',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <LoginView />
}
