import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'
import { safeText } from '@/lib/sanitizeHtml'

export const dynamic = 'force-dynamic'

function cleanCustomerName(title: string, clientName?: string | null, location?: string | null): string {
  if (clientName && clientName.trim() && !/^Lắp đặt|^Thi công|^Hệ thống/i.test(clientName.trim())) {
    return clientName.trim()
  }

  let name = (title || '').trim()

  // Strip action prefixes
  name = name.replace(/^Thi công lắp đặt, bảo trì Camera tại Huế/i, 'Khách Hàng Bảo Trì Định Kỳ')
  name = name.replace(/^Lắp đặt Khoá cửa thông minh, vân tay, mật mã, thẻ từ/i, 'Khách Hàng Khóa Cửa Thông Minh (Huế)')
  name = name.replace(/^Lắp đặt Camera không dây nhà dân/i, 'Hộ Gia Đình Nhà Phố (Huế)')
  name = name.replace(/^Lắp đặt, bảo trì Camera, Mạng\s+/i, '')
  name = name.replace(/^Lắp đặt Camera, Khóa cửa vân tay\s+/i, '')
  name = name.replace(/^Lắp đặt Camera, Máy chấm công\s+/i, '')
  name = name.replace(/^Lắp đặt Camera, Máy chiếu\s+/i, '')
  name = name.replace(/^Lắp đặt Camera, Mạng\s+/i, '')
  name = name.replace(/^Lắp đặt Camer, Mạng\s+/i, '')
  name = name.replace(/^Lắp đặt Camera cho\s+/i, '')
  name = name.replace(/^Lắp đặt Camera chuỗi\s+/i, 'Chuỗi ')
  name = name.replace(/^Lắp đặt Camera\s+/i, '')
  name = name.replace(/^Lắp đặt Camer\s+/i, '')
  name = name.replace(/^Thi công Camera, Khoá vân tay, Mạng\s+/i, '')
  name = name.replace(/^Thi công Camera\s+/i, '')
  name = name.replace(/^Lắp Đặt Hệ Thống \d+ Camera Giám Sát\s+/i, '')
  name = name.replace(/^Lắp Đặt Trọn Gói Bộ \d+ Camera[\w\s,]+Cho\s+/i, '')
  name = name.replace(/^Triển Khai Khóa Cửa Vân Tay[\w\s,]+Cho\s+/i, '')
  name = name.replace(/^Thi Công Hệ Thống Mạng[\w\s,]+Quán\s+/i, 'Quán ')
  name = name.replace(/^Thi Công Hệ Thống Mạng[\w\s,]+Quán Cafe\s+/i, '')
  name = name.replace(/^Hệ Thống Camera An Ninh[\w\s,&]+Cho\s+/i, '')
  name = name.replace(/^Hệ Thống Camera An Ninh[\w\s,&]+Nhà Xưởng\s+/i, 'Nhà Xưởng ')

  // Fix specific patterns
  if (/^nhà dân\s+(.*)/i.test(name)) {
    const loc = name.replace(/^nhà dân\s+/i, '')
    name = `Hộ Gia Đình (${loc})`
  } else if (/^căn hộ\s+(.*)/i.test(name)) {
    const loc = name.replace(/^căn hộ\s+/i, '')
    name = `Căn Hộ (${loc})`
  } else if (/^nhà dân$/i.test(name)) {
    name = `Hộ Gia Đình (${location || 'Huế'})`
  }

  // Common expansions
  if (name.toLowerCase() === 'đoàn thanh niên') name = 'Đoàn Thanh Niên (Huế)'
  if (name.toLowerCase() === 'đồ nướng sô 1') name = 'Quán Đồ Nướng Số 1'
  if (name.toLowerCase() === 'doanh nghiệp') name = 'Doanh Nghiệp / Cơ Quan (Huế)'
  if (name.toLowerCase().includes('tiệm kiết cf')) name = 'Tiệm Kiết Cafe'
  if (name.toLowerCase().includes('ohio cf')) name = 'Ohio Coffee'
  if (name.toLowerCase().includes('đông ba')) name = 'Hộ Kinh Doanh Chợ Đông Ba'
  if (name.toLowerCase().includes('vinpearl')) name = 'Khách sạn Meliá Vinpearl Huế'
  if (name.toLowerCase() === 'vincom huế') name = 'TTTM Vincom Plaza Huế'

  return name.trim() || 'Khách Hàng Công Trình Huế'
}

const KNOWN_PHONES_MAP: Record<string, { phone: string; zalo: string; isVip?: boolean; addr?: string }> = {
  'khách sạn hương giang resort & spa': { phone: '0234 3822 122', zalo: '0906425123', isVip: true, addr: '51 Lê Lợi, P. Phú Hội, TP. Huế' },
  'khách sạn meliá vinpearl huế': { phone: '0234 368 8666', zalo: '', isVip: true, addr: '50A Hùng Vương, TP. Huế' },
  'tttm vincom plaza huế': { phone: '0234 3839 666', zalo: '', isVip: true, addr: '50A Hùng Vương, TP. Huế' },
  'hue serena place hotel': { phone: '0234 3948 585', zalo: '0932457755', isVip: true, addr: '21/42 Nguyễn Thái Học, TP. Huế' },
  'tiệm bánh cậu ấm pastry bakery': { phone: '077 748 2889', zalo: '0777482889', isVip: false, addr: '109 Đinh Tiên Hoàng, TP. Huế' },
  'cậu ấm pastry bakery': { phone: '077 748 2889', zalo: '0777482889', isVip: false, addr: '109 Đinh Tiên Hoàng, TP. Huế' },
  'cửa hàng trái cây mai anh fruits': { phone: '079 272 1568', zalo: '0792721568', isVip: false, addr: '45 Lê Lợi, TP. Huế' },
  'mai anh fruits': { phone: '079 272 1568', zalo: '0792721568', isVip: false, addr: '45 Lê Lợi, TP. Huế' },
  'quận 1 beer garden': { phone: '0762 774 475', zalo: '0762774475', isVip: true, addr: '06 Võ Thị Sáu, P. Phú Hội, TP. Huế' },
  'nhà hàng chay tĩnh garden': { phone: '0931 931 434', zalo: '0931931434', isVip: true, addr: '140 Phan Bội Châu, TP. Huế' },
  'tĩnh garden vegetarian': { phone: '0931 931 434', zalo: '0931931434', isVip: true, addr: '140 Phan Bội Châu, TP. Huế' },
  'cư xá nhã uyên': { phone: '0234 3858 599', zalo: '', isVip: false, addr: '8/138 Nguyễn Sinh Cung, TP. Huế' },
}

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
      // default cleanReset to true
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

    // 2. Clean reset if requested
    if (cleanReset) {
      await db.from('installation_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await db.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    }

    // 3. Loop through posts and create 1 Customer & 1 Order per post
    const createdCustomers: any[] = []
    const createdOrders: any[] = []

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i]
      const clientName = cleanCustomerName(p.title, p.client_name, p.location)
      const clientKey = clientName.toLowerCase().trim()
      const knownInfo = KNOWN_PHONES_MAP[clientKey] || {}

      // Phone: Real phone from lookup or empty string (no fake phones!)
      const phone = knownInfo.phone || ''
      const zalo = knownInfo.zalo || ''

      // Location & District
      const loc = knownInfo.addr || p.location || 'TP. Huế'
      let district = 'TP. Huế (Trung tâm)'
      if (/Phú Bài|Hương Thủy/i.test(loc)) district = 'KCN Phú Bài - Hương Thủy'
      else if (/Hương Trà/i.test(loc)) district = 'TX. Hương Trà'
      else if (/Phú Vang/i.test(loc)) district = 'Huyện Phú Vang'
      else if (/Phú Lộc/i.test(loc)) district = 'Huyện Phú Lộc'
      else if (/Phong Điền|Quảng Điền/i.test(loc)) district = 'Huyện Phong Điền - Quảng Điền'

      const isBusiness = /Công ty|Khách sạn|Resort|Quán|Coffee|Cafe|Spa|Shop|Nhà hàng|Xưởng|Doanh nghiệp|Hotel|Club|Garden|Billiards|Fruits|Bakery/i.test(clientName)

      const isVip = Boolean(knownInfo.isVip || p.featured)

      const custRecord = {
        name: safeText(clientName, 255),
        phone: phone ? safeText(phone, 50) : '',
        phone_secondary: null,
        zalo: zalo ? safeText(zalo, 50) : '',
        email: null,
        address: safeText(loc, 500),
        district,
        type: isBusiness ? 'business' : 'individual',
        tier: isVip ? 'vip' : 'standard',
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

      const customerId = insertedCust ? insertedCust.id : null
      if (insertedCust) createdCustomers.push(insertedCust)

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
        customer_id: customerId,
        customer_name: safeText(clientName, 255),
        customer_phone: phone ? safeText(phone, 50) : '',
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
