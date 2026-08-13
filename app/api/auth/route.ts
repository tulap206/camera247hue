import { NextResponse } from 'next/server'
import {
  SESSION_COOKIE,
  createSessionToken,
  isAdminSession,
  passwordMatches,
  sessionCookieOptions,
} from '@/lib/adminSession'
import { clientIp, rateLimit } from '@/lib/rateLimit'

export async function GET() {
  if (!isAdminSession()) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'Thử lại sau vài phút.' }, { status: 429 })
  }

  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 })
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions())
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0))
  return res
}
