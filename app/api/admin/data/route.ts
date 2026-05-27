import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = supabaseAdmin()
    
    const [
      { data: posts, error: postsErr },
      { data: categories, error: catsErr },
      { data: contacts, error: contactsErr }
    ] = await Promise.all([
      db.from('posts').select('*, category:categories(*)').order('created_at', { ascending: false }),
      db.from('categories').select('*').order('name'),
      db.from('contact_messages').select('*').order('created_at', { ascending: false })
    ])

    if (postsErr) return NextResponse.json({ error: postsErr.message }, { status: 400 })
    if (catsErr) return NextResponse.json({ error: catsErr.message }, { status: 400 })
    if (contactsErr) return NextResponse.json({ error: contactsErr.message }, { status: 400 })

    return NextResponse.json({ posts, categories, contacts })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
