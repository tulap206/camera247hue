import { NextResponse } from 'next/server'
import {
  clearAdminSessionCookie,
  requireAdminSession,
  setAdminSessionCookie,
  unauthorizedAdminResponse,
} from '@/lib/admin-session'

export async function GET() {
  if (!requireAdminSession()) return unauthorizedAdminResponse()

  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminSecret = process.env.ADMIN_SECRET || 'camera247hue_admin_2024'
  
  if (password === adminSecret) {
    const response = NextResponse.json({ ok: true })
    setAdminSessionCookie(response)
    return response
  }
  
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  clearAdminSessionCookie(response)
  return response
}
