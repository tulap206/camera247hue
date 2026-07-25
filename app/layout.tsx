import type { Metadata } from "next"
import { Be_Vietnam_Pro, Oswald } from "next/font/google"
import "../styles/globals.css"

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
})

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: "Camera 247 Huế — Giải pháp công nghệ an ninh",
  description:
    "Công ty TNHH Giải Pháp Công Nghệ An Ninh Camera 247 Huế. Thi công camera an ninh, khóa cửa thông minh, hệ thống mạng, báo trộm chuyên nghiệp tại Tp. Huế.",
  keywords:
    "camera an ninh huế, lắp camera huế, khóa cửa thông minh huế, hệ thống mạng huế, camera 247, an ninh huế",
  authors: [{ name: "Camera 247 Huế" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://camera247hue.com",
    siteName: "Camera 247 Huế",
    title: "Camera 247 Huế — Giải pháp công nghệ an ninh",
    description:
      "Thi công camera an ninh, khóa cửa thông minh, hệ thống mạng chuyên nghiệp tại Tp. Huế",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  themeColor: "#F5C518",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${oswald.variable}`}>
      <body className={`${beVietnam.className} antialiased`}>{children}</body>
    </html>
  )
}
