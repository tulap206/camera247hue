import Link from "next/link"
import { Shield, Phone, MapPin, Facebook, ChevronRight } from "lucide-react"

const services = [
  "Camera An Ninh",
  "Khóa Cửa Thông Minh",
  "Hệ Thống Mạng",
  "Báo Trộm & Định Vị",
  "Máy Chấm Công",
  "Máy Tính & Thiết Bị",
]

const categories = [
  { name: "Khách Sạn", slug: "khach-san" },
  { name: "Quán Cà Phê", slug: "quan-ca-phe" },
  { name: "Nhà Dân", slug: "nha-dan" },
  { name: "Đường Phố", slug: "duong-pho" },
  { name: "Doanh Nghiệp", slug: "doanh-nghiep" },
  { name: "Trường Học", slug: "truong-hoc" },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a]">
      <div className="h-0.5 bg-[#F5C518]/70" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5C518]">
                <Shield className="size-5 text-black" />
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-[#F5C518]">CAMERA 247 HUẾ</p>
                <p className="text-xs text-zinc-500">Giải pháp công nghệ an ninh</p>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-zinc-500">
              Công ty TNHH Giải Pháp Công Nghệ An Ninh Camera 247 Huế — lắp đặt camera và hệ thống an
              ninh tại Tp. Huế.
            </p>
            <div className="space-y-2 text-sm text-zinc-500">
              <a
                href="tel:0967611112"
                className="flex items-center gap-2 transition-colors hover:text-[#F5C518]"
              >
                <Phone className="size-4 shrink-0" /> 0967 611 112
              </a>
              <a
                href="https://maps.google.com/?q=40+Tùng+Thiện+Vương+Huế"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 transition-colors hover:text-[#F5C518]"
              >
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>40 Tùng Thiện Vương, Vỹ Dạ, Tp. Huế</span>
              </a>
              <a
                href="https://facebook.com/Camera247Hue"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-[#F5C518]"
              >
                <Facebook className="size-4" /> Camera247Hue
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold tracking-wide text-white uppercase">
              Dịch vụ
            </h4>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#dich-vu"
                    className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-[#F5C518]"
                  >
                    <ChevronRight className="size-3" /> {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold tracking-wide text-white uppercase">
              Công trình
            </h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/cong-trinh?category=${c.slug}`}
                    className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-[#F5C518]"
                  >
                    <ChevronRight className="size-3" /> {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold tracking-wide text-white uppercase">
              Liên kết
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Trang chủ", href: "/" },
                { label: "Dịch vụ", href: "/#dich-vu" },
                { label: "Công trình", href: "/cong-trinh" },
                { label: "Liên hệ", href: "/#lien-he" },
                { label: "Đăng nhập Admin", href: "/admin" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-[#F5C518]"
                  >
                    <ChevronRight className="size-3" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-sm text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Camera 247 Huế. Bảo lưu mọi quyền.</p>
          <p>
            Thiết kế bởi Phan Lê Tự Lập ·{" "}
            <a href="tel:0967611112" className="text-[#F5C518] hover:underline">
              0967 611 112
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
