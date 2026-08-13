import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const db = supabaseAdmin()
    const [
      { data: posts, error: postsErr },
      { data: categories, error: catsErr },
      { data: contacts, error: contactsErr },
    ] = await Promise.all([
      db.from('posts').select('*, category:categories(*)').order('created_at', { ascending: false }),
      db.from('categories').select('*').order('name'),
      db.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ])

    if (postsErr || catsErr || contactsErr) {
      return NextResponse.json({ error: 'Không tải được dữ liệu.' }, { status: 400 })
    }

    return NextResponse.json({ posts, categories, contacts })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}
