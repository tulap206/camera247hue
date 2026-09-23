import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'
import { safeText } from '@/lib/sanitizeHtml'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const db = supabaseAdmin()
    const { data: logs, error } = await db
      .from('access_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json({ error: error.message, logs: [] }, { status: 200 })
    }

    return NextResponse.json({ logs: logs || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, logs: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { username = 'admin', displayName, action, module, details, ip_address } = body

    if (!action || !module || !details) {
      return NextResponse.json({ error: 'Thiếu thông tin nhật ký' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const newLog = {
      username: safeText(username, 100),
      display_name: displayName ? safeText(displayName, 255) : null,
      action: safeText(action, 100),
      module: safeText(module, 100),
      details: safeText(details, 1000),
      ip_address: ip_address || '113.161.78.45',
      timestamp: new Date().toISOString(),
    }

    const { data, error } = await db.from('access_logs').insert([newLog]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 200 })
    }

    return NextResponse.json({ log: data, ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE() {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const db = supabaseAdmin()
    const { error } = await db.from('access_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
