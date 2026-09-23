import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B1F33',
}

export const metadata: Metadata = {
  title: 'Camera 247 Huế - Giải Pháp Công Nghệ An Ninh',
  description:
    'Công ty TNHH Công nghệ An ninh Camera247 Huế. Thi công camera an ninh, khóa cửa thông minh, hệ thống mạng, báo trộm chuyên nghiệp tại Tp. Huế.',
  keywords:
    'camera an ninh huế, lắp camera huế, khóa cửa thông minh huế, hệ thống mạng huế, camera 247, an ninh huế',
  authors: [{ name: 'Camera 247 Huế' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://camera247hue.com',
    siteName: 'Camera 247 Huế',
    title: 'Camera 247 Huế - Giải Pháp Công Nghệ An Ninh',
    description: 'Thi công camera an ninh, khóa cửa thông minh, hệ thống mạng chuyên nghiệp tại Tp. Huế',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
