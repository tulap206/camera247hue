import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import ProjectsList from '@/components/ProjectsList'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/lib/supabase'

export const revalidate = 60

export const metadata = {
  title: 'Công Trình Đã Thi Công - Camera 247 Huế',
  description:
    'Xem các công trình camera an ninh, khóa thông minh, hệ thống mạng đã triển khai bởi Camera 247 Huế.',
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from('categories').select('*').order('name')
  return data || []
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const categories = await getCategories()

  return (
    <main>
      <Navbar />
      <div className="pt-[68px]">
        <div className="bg-white border-b border-brand-border">
          <div className="container-page py-14 sm:py-16">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy mb-3">
              Công trình đã thi công
            </h1>
            <p className="text-brand-muted max-w-xl leading-relaxed">
              Các dự án camera an ninh, khóa thông minh và hệ thống mạng Camera 247 Huế đã triển khai.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          }
        >
          <ProjectsList
            categories={categories}
            activeCategory={searchParams.category}
            currentPage={Number(searchParams.page) || 1}
          />
        </Suspense>
      </div>
      <Footer />
      <FloatingContact />
    </main>
  )
}
