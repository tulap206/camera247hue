import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'
import { safeText } from '@/lib/sanitizeHtml'

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const name = safeText(body?.name, 80)
    const description = safeText(body?.description, 300)
    const icon = safeText(body?.icon, 40) || 'building'

    if (!name) {
      return NextResponse.json({ error: 'Tên danh mục là bắt buộc.' }, { status: 400 })
    }

    const slug = generateSlug(name)
    const db = supabaseAdmin()
    const { data: category, error } = await db
      .from('categories')
      .insert([{ name, slug, description, icon }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Không tạo được danh mục.' }, { status: 400 })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const id = typeof body?.id === 'string' ? body.id : ''
    const name = safeText(body?.name, 80)
    const description = safeText(body?.description, 300)
    const icon = safeText(body?.icon, 40) || 'building'

    if (!id || !name) {
      return NextResponse.json({ error: 'ID và Tên danh mục là bắt buộc.' }, { status: 400 })
    }

    const slug = generateSlug(name)
    const db = supabaseAdmin()
    const { data: category, error } = await db
      .from('categories')
      .update({ name, slug, description, icon })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Không cập nhật được.' }, { status: 400 })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Yêu cầu ID.' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { error } = await db.from('categories').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Không xóa được.' }, { status: 400 })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}
