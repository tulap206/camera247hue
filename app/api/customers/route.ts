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
    const { data: customers, error } = await db
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message, customers: [] }, { status: 200 })
    }

    return NextResponse.json({ customers: customers || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, customers: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const {
      name,
      phone,
      phone_secondary,
      zalo,
      email,
      address,
      district = 'Phường Vĩnh Ninh',
      type = 'individual',
      tier = 'standard',
      tax_code,
      idcard,
      notes,
    } = body

    if (!name || !phone || !address) {
      return NextResponse.json({ error: 'Vui lòng nhập tên, số điện thoại và địa chỉ.' }, { status: 400 })
    }

    const newRecord = {
      name: safeText(name, 255),
      phone: safeText(phone, 50),
      phone_secondary: phone_secondary ? safeText(phone_secondary, 100) : null,
      zalo: zalo ? safeText(zalo, 50) : null,
      email: email ? safeText(email, 255) : null,
      address: safeText(address, 500),
      district: safeText(district, 100),
      type: type === 'business' ? 'business' : 'individual',
      tier: tier || 'standard',
      tax_code: tax_code ? safeText(tax_code, 50) : null,
      idcard: idcard ? safeText(idcard, 50) : null,
      notes: notes ? safeText(notes, 1000) : null,
      total_orders: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const db = supabaseAdmin()
    const { data, error } = await db.from('customers').insert([newRecord]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ customer: data, ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi tạo khách hàng' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { id, ...updateFields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID khách hàng là bắt buộc' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const recordToUpdate: Record<string, any> = {
      ...updateFields,
      updated_at: new Date().toISOString(),
    }
    delete recordToUpdate.id

    const { data, error } = await db
      .from('customers')
      .update(recordToUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ customer: data, ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi cập nhật khách hàng' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID khách hàng là bắt buộc' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { error } = await db.from('customers').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi xóa khách hàng' }, { status: 500 })
  }
}
