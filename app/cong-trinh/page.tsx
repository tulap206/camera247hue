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
  description: 'Xem các công trình camera an ninh, khóa thông minh, hệ thống mạng đã triển khai bởi Camera 247 Huế.',
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
      <div className="pt-20">
        {/* Hero banner */}
        <div className="relative py-16 bg-gradient-to-b from-[#1A1200] to-[#0D0D0D] overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(#F5C518 1px, transparent 1px), linear-gradient(90deg, #F5C518 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-1 hazard-stripe opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-1 hazard-stripe opacity-60" />
          <div className="relative z-10 text-center px-4">
            <div className="inline-flex items-center gap-2 text-[#F5C518] text-sm font-medium mb-4 tracking-widest uppercase">
              <span className="w-8 h-px bg-[#F5C518]" />
              Portfolio
              <span className="w-8 h-px bg-[#F5C518]" />
            </div>
            <h1 style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-4xl sm:text-5xl font-bold text-white mb-3">
              CÔNG TRÌNH ĐÃ THI CÔNG
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Hàng trăm công trình camera an ninh, khóa thông minh và hệ thống mạng 
              đã được Camera 247 Huế triển khai thành công.
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        }>
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
