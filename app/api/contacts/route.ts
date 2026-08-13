import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'
import { clientIp, rateLimit } from '@/lib/rateLimit'
import { safeText } from '@/lib/sanitizeHtml'

export async function POST(request: Request) {
  const ip = clientIp(request)
  if (!rateLimit(`contact:${ip}`, 6, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'Bạn đã gửi quá nhiều yêu cầu. Thử lại sau.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const name = safeText(body?.name, 80)
    const phone = safeText(body?.phone, 20).replace(/[^\d+\s.-]/g, '')
    const email = safeText(body?.email, 120)
    const service = safeText(body?.service, 80)
    const message = safeText(body?.message, 2000)

    if (name.length < 2 || phone.replace(/\D/g, '').length < 8) {
      return NextResponse.json({ error: 'Họ tên và số điện thoại là bắt buộc.' }, { status: 400 })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { error } = await db.from('contact_messages').insert([
      {
        name,
        phone,
        email: email || null,
        service: service || null,
        message,
        read: false,
      },
    ])

    if (error) {
      return NextResponse.json({ error: 'Không gửi được. Vui lòng gọi trực tiếp.' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Không gửi được. Vui lòng gọi trực tiếp.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { id, read } = body
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID là bắt buộc.' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data, error } = await db
      .from('contact_messages')
      .update({ read: !!read })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Không cập nhật được.' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}
