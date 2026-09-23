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
      { data: customers, error: custErr },
      { data: orders, error: ordersErr },
      { data: logs, error: logsErr },
    ] = await Promise.all([
      db.from('posts').select('*, category:categories(*)').order('created_at', { ascending: false }),
      db.from('categories').select('*').order('name'),
      db.from('contact_messages').select('*').order('created_at', { ascending: false }),
      db.from('customers').select('*').order('created_at', { ascending: false }),
      db.from('installation_orders').select('*').order('created_at', { ascending: false }),
      db.from('access_logs').select('*').order('timestamp', { ascending: false }).limit(200),
    ])

    if (postsErr) console.warn('Supabase posts error:', postsErr.message)
    if (catsErr) console.warn('Supabase categories error:', catsErr.message)
    if (contactsErr) console.warn('Supabase contacts error:', contactsErr.message)
    if (custErr) console.warn('Supabase customers error:', custErr.message)
    if (ordersErr) console.warn('Supabase orders error:', ordersErr.message)
    if (logsErr) console.warn('Supabase logs error:', logsErr.message)

    return NextResponse.json({
      posts: posts || [],
      categories: categories || [],
      contacts: contacts || [],
      customers: customers || [],
      orders: orders || [],
      logs: logs || [],
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi máy chủ.' }, { status: 500 })
  }
}
