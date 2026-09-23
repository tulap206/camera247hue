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
    const { data: orders, error } = await db
      .from('installation_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message, orders: [] }, { status: 200 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, orders: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const {
      order_code,
      customer_id,
      customer_name,
      customer_phone,
      customer_address,
      services = ['camera'],
      equipment_list = '',
      installation_date,
      completion_date,
      warranty_months = 24,
      warranty_until,
      total_amount = 0,
      deposit_amount = 0,
      status = 'warranty',
      technician = 'Phan Lê Tự Lập & Phạm Bá Tước',
      notes,
    } = body

    if (!customer_name || !customer_phone || !customer_address) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin khách hàng.' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const finalCode = order_code || `C247-2026-${Date.now().toString().slice(-4)}`

    const newRecord = {
      order_code: safeText(finalCode, 50),
      customer_id: customer_id || null,
      customer_name: safeText(customer_name, 255),
      customer_phone: safeText(customer_phone, 50),
      customer_address: safeText(customer_address, 500),
      services: Array.isArray(services) ? services : ['camera'],
      equipment_list: safeText(equipment_list, 1000),
      installation_date: installation_date || new Date().toLocaleDateString('vi-VN'),
      completion_date: completion_date || null,
      warranty_months: Number(warranty_months) || 24,
      warranty_until: warranty_until || null,
      total_amount: Number(total_amount) || 0,
      deposit_amount: Number(deposit_amount) || 0,
      status: status || 'warranty',
      technician: safeText(technician, 100),
      notes: notes ? safeText(notes, 1000) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await db.from('installation_orders').insert([newRecord]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ order: data, ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi tạo đơn hàng' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { id, ...updateFields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID đơn hàng là bắt buộc' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const recordToUpdate: Record<string, any> = {
      ...updateFields,
      updated_at: new Date().toISOString(),
    }
    delete recordToUpdate.id

    const { data, error } = await db
      .from('installation_orders')
      .update(recordToUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ order: data, ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi cập nhật đơn hàng' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID đơn hàng là bắt buộc' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { error } = await db.from('installation_orders').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi xóa đơn hàng' }, { status: 500 })
  }
}
