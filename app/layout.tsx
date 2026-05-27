import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Camera 247 Huế - Giải Pháp Công Nghệ An Ninh',
  description: 'Công ty TNHH Giải Pháp Công Nghệ An Ninh Camera 247 Huế. Thi công camera an ninh, khóa cửa thông minh, hệ thống mạng, báo trộm chuyên nghiệp tại Tp. Huế.',
  keywords: 'camera an ninh huế, lắp camera huế, khóa cửa thông minh huế, hệ thống mạng huế, camera 247, an ninh huế',
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
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#F5C518',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
