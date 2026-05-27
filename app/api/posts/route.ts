import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    if (data.category_id === '') data.category_id = null
    if (data.completed_at === '') data.completed_at = null
    
    const db = supabaseAdmin()
    const { data: post, error } = await db
      .from('posts')
      .insert([data])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(post)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, category, ...data } = body
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    if (data.category_id === '') data.category_id = null
    if (data.completed_at === '') data.completed_at = null
    
    const db = supabaseAdmin()
    const { data: post, error } = await db
      .from('posts')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(post)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const db = supabaseAdmin()
    const { error } = await db.from('posts').delete().eq('id', id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
