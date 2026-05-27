import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminSecret = process.env.ADMIN_SECRET || 'camera247hue_admin_2024'
  
  if (password === adminSecret) {
    return NextResponse.json({ ok: true })
  }
  
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
