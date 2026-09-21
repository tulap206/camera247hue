import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import PartnersSection from '@/components/PartnersSection'
import ServicesSection from '@/components/ServicesSection'
import ProcessSection from '@/components/ProcessSection'
import ProjectsPreview from '@/components/ProjectsPreview'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

async function getFeaturedPosts() {
  const { data } = await supabase
    .from('posts')
    .select('*, category:categories(*)')
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)
  return data || []
}

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts()

  return (
    <main className="relative overflow-x-clip">
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
