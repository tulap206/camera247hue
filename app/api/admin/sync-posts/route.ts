import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'
import { safeText } from '@/lib/sanitizeHtml'

export const dynamic = 'force-dynamic'

export async function POST() {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const db = supabaseAdmin()

    // 1. Fetch all posts from Supabase
    const { data: posts, error: postsErr } = await db.from('posts').select('*').order('created_at', { ascending: true })
    if (postsErr) {
      return NextResponse.json({ error: postsErr.message }, { status: 400 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'Không có bài viết nào để đồng bộ.', synced: 0 })
    }

    // 2. Fetch existing customers and orders
    const [{ data: existingCustomers }, { data: existingOrders }] = await Promise.all([
      db.from('customers').select('*'),
      db.from('installation_orders').select('*'),
    ])

    const custMap = new Map<string, any>()
    for (const c of existingCustomers || []) {
      if (c.name) custMap.set(c.name.trim().toLowerCase(), c)
    }

    const orderCodes = new Set((existingOrders || []).map((o) => o.order_code))
    const orderNotes = new Set((existingOrders || []).map((o) => o.notes))

    let createdCustomersCount = 0
    let createdOrdersCount = 0

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i]
      const clientName = (p.client_name || p.title || `Khách hàng công trình #${i + 1}`).trim()
      const clientKey = clientName.toLowerCase()

      let customer = custMap.get(clientKey)

      // Determine district from location
      const loc = p.location || 'TP. Huế'
      let district = 'TP. Huế (Trung tâm)'
      if (/Phú Bài|Hương Thủy/i.test(loc)) district = 'KCN Phú Bài - Hương Thủy'
      else if (/Hương Trà/i.test(loc)) district = 'TX. Hương Trà'
      else if (/Phú Vang/i.test(loc)) district = 'Huyện Phú Vang'
      else if (/Phú Lộc/i.test(loc)) district = 'Huyện Phú Lộc'
      else if (/Phong Điền|Quảng Điền/i.test(loc)) district = 'Huyện Phong Điền - Quảng Điền'

      const isBusiness = /Công ty|Khách sạn|Resort|Quán|Coffee|Cafe|Spa|Shop|Nhà hàng|Xưởng|Doanh nghiệp/i.test(clientName)

      // 1. Create Customer if not exists
      if (!customer) {
        const newCustomerRecord = {
          name: safeText(clientName, 255),
          phone: '0967 611 112',
          phone_secondary: null,
          zalo: '0967611112',
          email: null,
          address: safeText(loc, 500),
          district,
          type: isBusiness ? 'business' : 'individual',
          tier: p.featured ? 'vip' : 'standard',
          tax_code: null,
          idcard: null,
          notes: safeText(`Khách hàng từ bài viết công trình: ${p.title}`, 1000),
          total_orders: 1,
          total_spent: 0,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: insertedCust, error: insErr } = await db
          .from('customers')
          .insert([newCustomerRecord])
          .select()
          .single()

        if (!insErr && insertedCust) {
          customer = insertedCust
          custMap.set(clientKey, insertedCust)
          createdCustomersCount++
        }
      }

      // 2. Create Order if not exists
      const postOrderTag = `Công trình: ${p.slug}`
      const hasOrder = Array.from(orderNotes).some((n) => n && n.includes(p.slug))

      if (!hasOrder) {
        const orderNum = String(i + 1).padStart(3, '0')
        let orderCode = `C247-2026-${orderNum}`
        if (orderCodes.has(orderCode)) {
          orderCode = `C247-2026-${orderNum}-${Date.now().toString().slice(-3)}`
        }

        const completedDateStr = p.completed_at
          ? new Date(p.completed_at).toLocaleDateString('vi-VN')
          : new Date(p.created_at || Date.now()).toLocaleDateString('vi-VN')

        // Calculate 24 months warranty until
        const baseDate = p.completed_at ? new Date(p.completed_at) : new Date(p.created_at || Date.now())
        const warrantyDate = new Date(baseDate)
        warrantyDate.setFullYear(warrantyDate.getFullYear() + 2)
        const warrantyUntilStr = warrantyDate.toLocaleDateString('vi-VN')

        // Infer services
        const services: string[] = []
        const textToScan = `${p.title} ${p.excerpt || ''} ${p.content || ''}`
        if (/camera|giám sát|cctv/i.test(textToScan)) services.push('camera')
        if (/khóa|faceid|vân tay/i.test(textToScan)) services.push('smart_lock')
        if (/wifi|mạng|router/i.test(textToScan)) services.push('wifi')
        if (/chấm công|vào ra/i.test(textToScan)) services.push('time_attendance')
        if (/báo động|chống trộm/i.test(textToScan)) services.push('alarm')
        if (services.length === 0) services.push('camera')

        const equipment = p.excerpt
          ? p.excerpt
          : `Hạng mục thi công hệ thống thiết bị an ninh cho công trình ${p.title}`

        const newOrderRecord = {
          order_code: orderCode,
          customer_id: customer?.id || null,
          customer_name: safeText(clientName, 255),
          customer_phone: customer?.phone || '0967 611 112',
          customer_address: safeText(loc, 500),
          services,
          equipment_list: safeText(equipment, 1000),
          installation_date: completedDateStr,
          completion_date: completedDateStr,
          warranty_months: 24,
          warranty_until: warrantyUntilStr,
          total_amount: 0,
          deposit_amount: 0,
          status: 'warranty',
          technician: 'Phan Lê Tự Lập & Phạm Bá Tước',
          notes: safeText(`Đơn thi công công trình: ${p.title} (${postOrderTag})`, 1000),
          created_at: p.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: orderInsErr } = await db.from('installation_orders').insert([newOrderRecord])
        if (!orderInsErr) {
          orderCodes.add(orderCode)
          orderNotes.add(postOrderTag)
          createdOrdersCount++
        }
      }
    }

    return NextResponse.json({
      ok: true,
      totalPosts: posts.length,
      createdCustomers: createdCustomersCount,
      createdOrders: createdOrdersCount,
      message: `Đã đồng bộ thành công từ ${posts.length} bài viết sang ${createdCustomersCount} khách hàng mới và ${createdOrdersCount} đơn hàng mới!`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi đồng bộ bài viết' }, { status: 500 })
  }
}
