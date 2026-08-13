import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminSession'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const MAX_SIZE = 8 * 1024 * 1024

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Chưa chọn tệp.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ảnh tối đa 8MB.' }, { status: 400 })
    }
    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Chỉ nhận JPG, PNG, WEBP, GIF.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
    const filePath = `uploads/${fileName}`

    const db = supabaseAdmin()
    const { error } = await db.storage.from('posts-images').upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      return NextResponse.json({ error: 'Không tải được ảnh.' }, { status: 400 })
    }

    const { data: urlData } = db.storage.from('posts-images').getPublicUrl(filePath)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 })
  }
}
