import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

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
  try {
    const body = await request.json()
    const { name, description, icon } = body

    if (!name) {
      return NextResponse.json({ error: 'Tên danh mục là bắt buộc.' }, { status: 400 })
    }

    const slug = generateSlug(name)
    const db = supabaseAdmin()
    const { data: category, error } = await db
      .from('categories')
      .insert([{
        name,
        slug,
        description: description || '',
        icon: icon || 'building'
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, icon } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID và Tên danh mục là bắt buộc.' }, { status: 400 })
    }

    const slug = generateSlug(name)
    const db = supabaseAdmin()
    const { data: category, error } = await db
      .from('categories')
      .update({
        name,
        slug,
        description: description || '',
        icon: icon || 'building'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Yêu cầu ID.' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { error } = await db
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
