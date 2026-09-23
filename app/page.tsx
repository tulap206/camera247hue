import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import PartnersSection from '@/components/PartnersSection'
import ServicesSection from '@/components/ServicesSection'
import ProcessSection from '@/components/ProcessSection'
import ProjectsPreview from '@/components/ProjectsPreview'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import VisitorTracker from '@/components/VisitorTracker'
import { supabase } from '@/lib/supabase'
import { SAMPLE_POSTS } from '@/lib/camera247-data'

export const revalidate = 60

async function getFeaturedPosts() {
  try {
    const { data } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('published', true)
      .order('completed_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(6)
    if (data && data.length > 0) return data
  } catch {
    // fallback
  }
  return (SAMPLE_POSTS as unknown as any[]) || []
}

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts()

  return (
    <main className="relative overflow-x-clip">
      <VisitorTracker pageName="Trang chủ Landing Page" module="Landing Page" />
      <Navbar />
      <HeroSection />
      <PartnersSection />
      <ServicesSection />
      <ProcessSection />
      <ProjectsPreview posts={featuredPosts} />
      <ContactSection />
      <Footer />
      <FloatingContact />
    </main>
  )
}
