import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'
import { safeText } from '@/lib/sanitizeHtml'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const db = supabaseAdmin()
    let cleanReset = true
    try {
      const body = await request.json()
      if (body && typeof body.cleanReset === 'boolean') {
        cleanReset = body.cleanReset
      }
    } catch {
      // default cleanReset to true for automatic self-healing
    }

    // 1. Fetch all posts from Supabase
    const { data: posts, error: postsErr } = await db
      .from('posts')
      .select('*')
      .order('created_at', { ascending: true })

    if (postsErr) {
      return NextResponse.json({ error: postsErr.message }, { status: 400 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'Không có bài viết nào để đồng bộ.', synced: 0 })
    }

    // 2. If cleanReset is requested, remove duplicated / orphaned customers & orders
    if (cleanReset) {
      await db.from('installation_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await db.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    }

    // 3. Loop through all posts and create 1 Customer & 1 Order per post
    const createdCustomers: any[] = []
    const createdOrders: any[] = []
    const custMap = new Map<string, any>()

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i]
      const clientName = (p.client_name || p.title || `Khách hàng công trình #${i + 1}`).trim()
      const clientKey = clientName.toLowerCase()

      // Location & District
      const loc = p.location || 'TP. Huế'
      let district = 'TP. Huế (Trung tâm)'
      if (/Phú Bài|Hương Thủy/i.test(loc)) district = 'KCN Phú Bài - Hương Thủy'
      else if (/Hương Trà/i.test(loc)) district = 'TX. Hương Trà'
      else if (/Phú Vang/i.test(loc)) district = 'Huyện Phú Vang'
      else if (/Phú Lộc/i.test(loc)) district = 'Huyện Phú Lộc'
      else if (/Phong Điền|Quảng Điền/i.test(loc)) district = 'Huyện Phong Điền - Quảng Điền'

      const isBusiness = /Công ty|Khách sạn|Resort|Quán|Coffee|Cafe|Spa|Shop|Nhà hàng|Xưởng|Doanh nghiệp/i.test(clientName)

      // Get or create customer
      let customerId = custMap.get(clientKey)?.id

      if (!customerId) {
        const custRecord = {
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

        const { data: insertedCust, error: custErr } = await db
          .from('customers')
          .insert([custRecord])
          .select()
          .single()

        if (!custErr && insertedCust) {
          customerId = insertedCust.id
          custMap.set(clientKey, insertedCust)
          createdCustomers.push(insertedCust)
        }
      }

      // Order Code
      const orderNum = String(i + 1).padStart(3, '0')
      const orderCode = `C247-2026-${orderNum}`

      const completedDateStr = p.completed_at
        ? new Date(p.completed_at).toLocaleDateString('vi-VN')
        : new Date(p.created_at || Date.now()).toLocaleDateString('vi-VN')

      const baseDate = p.completed_at ? new Date(p.completed_at) : new Date(p.created_at || Date.now())
      const warrantyDate = new Date(baseDate)
      warrantyDate.setFullYear(warrantyDate.getFullYear() + 2)
      const warrantyUntilStr = warrantyDate.toLocaleDateString('vi-VN')

      // Services
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
        : `Hạng mục thi công thiết bị an ninh công trình ${p.title}`

      const orderRecord = {
        order_code: orderCode,
        customer_id: customerId || null,
        customer_name: safeText(clientName, 255),
        customer_phone: '0967 611 112',
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
        notes: safeText(`Công trình: ${p.title} (${p.slug})`, 1000),
        created_at: p.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: insertedOrder, error: ordErr } = await db
        .from('installation_orders')
        .insert([orderRecord])
        .select()
        .single()

      if (!ordErr && insertedOrder) {
        createdOrders.push(insertedOrder)
      }
    }

    return NextResponse.json({
      ok: true,
      totalPosts: posts.length,
      customersCount: createdCustomers.length,
      ordersCount: createdOrders.length,
      message: `Đã xử lý tự động & đồng bộ chuẩn xác: ${posts.length} bài viết ➔ ${createdCustomers.length} khách hàng ➔ ${createdOrders.length} đơn hàng!`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi đồng bộ bài viết' }, { status: 500 })
  }
}
