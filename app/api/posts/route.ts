import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'
import { sanitizeHtml, safeText } from '@/lib/sanitizeHtml'

const POST_FIELDS = [
  'title',
  'slug',
  'content',
  'excerpt',
  'cover_image',
  'images',
  'category_id',
  'location',
  'client_name',
  'completed_at',
  'featured',
  'published',
] as const

function pickPostData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  for (const key of POST_FIELDS) {
    if (key in body) data[key] = body[key]
  }
  if (data.category_id === '') data.category_id = null
  if (data.completed_at === '') data.completed_at = null
  if (typeof data.title === 'string') data.title = safeText(data.title, 200)
  if (typeof data.slug === 'string') data.slug = safeText(data.slug, 200)
  if (typeof data.excerpt === 'string') data.excerpt = safeText(data.excerpt, 500)
  if (typeof data.location === 'string') data.location = safeText(data.location, 120)
  if (typeof data.client_name === 'string') data.client_name = safeText(data.client_name, 120)
  if (typeof data.content === 'string') data.content = sanitizeHtml(data.content).slice(0, 20000)
  if (typeof data.cover_image === 'string') data.cover_image = safeText(data.cover_image, 500)
  if (Array.isArray(data.images)) {
    data.images = data.images.filter((x) => typeof x === 'string').slice(0, 20)
  }
  data.featured = !!data.featured
  data.published = !!data.published
  return data
}

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const data = pickPostData(body)
    if (!data.title) return NextResponse.json({ error: 'Thiếu tiêu đề.' }, { status: 400 })

    const db = supabaseAdmin()
    const { data: post, error } = await db.from('posts').insert([data]).select().single()
    if (error) return NextResponse.json({ error: 'Không lưu được bài viết.' }, { status: 400 })

    revalidatePath('/', 'layout')
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { id } = body
    if (!id || typeof id !== 'string') return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const data = pickPostData(body)
    const db = supabaseAdmin()
    const { data: post, error } = await db.from('posts').update(data).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: 'Không cập nhật được.' }, { status: 400 })

    revalidatePath('/', 'layout')
    return NextResponse.json(post)
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
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const db = supabaseAdmin()
    const { error } = await db.from('posts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Không xóa được.' }, { status: 400 })

    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}
