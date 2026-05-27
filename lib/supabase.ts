import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export const supabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  created_at: string
}

export type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  images: string[]
  category_id: string
  category?: Category
  location: string
  client_name: string
  completed_at: string
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export type ContactMessage = {
  id: string
  name: string
  phone: string
  email: string
  message: string
  service: string
  created_at: string
  read: boolean
}
