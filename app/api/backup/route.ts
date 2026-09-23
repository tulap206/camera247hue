import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const db = supabaseAdmin()
    const { data: backups, error } = await db
      .from('cloud_backups')
      .select('id, backup_name, version, created_by, creator_name, customers_count, orders_count, posts_count, categories_count, logs_count, file_size_bytes, notes, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message, backups: [] }, { status: 200 })
    }

    return NextResponse.json({ backups: backups || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi kết nối máy chủ', backups: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const {
      backup_name,
      version = '2.5',
      created_by = 'admin',
      creator_name = 'Quản trị viên (Lập)',
      customers_count = 0,
      orders_count = 0,
      posts_count = 0,
      categories_count = 0,
      logs_count = 0,
      payload = {},
      notes = '',
    } = body

    if (!backup_name) {
      return NextResponse.json({ error: 'Tên bản sao lưu không được để trống.' }, { status: 400 })
    }

    const payloadStr = JSON.stringify(payload)
    const file_size_bytes = new Blob([payloadStr]).size

    const record = {
      backup_name,
      version,
      created_by,
      creator_name,
      customers_count,
      orders_count,
      posts_count,
      categories_count,
      logs_count,
      payload,
      file_size_bytes,
      notes,
      created_at: new Date().toISOString(),
    }

    const db = supabaseAdmin()
    const { data, error } = await db.from('cloud_backups').insert([record]).select().single()

    if (error) {
      // Return ok: false with error details so client can store locally if table is missing
      return NextResponse.json({ ok: false, error: error.message, record }, { status: 200 })
    }

    return NextResponse.json({ ok: true, backup: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Lỗi tạo sao lưu đám mây.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const db = supabaseAdmin()
    const { error } = await db.from('cloud_backups').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
