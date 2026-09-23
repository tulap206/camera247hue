import { NextResponse } from 'next/server'
import {
  SESSION_COOKIE,
  createSessionToken,
  isAdminSession,
  getSessionUsername,
  passwordMatches,
  sessionCookieOptions,
  ADMIN_USERS,
} from '@/lib/adminSession'
import { clientIp, rateLimit } from '@/lib/rateLimit'

export async function GET() {
  if (!isAdminSession()) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const user = getSessionUsername()
  return NextResponse.json({
    ok: true,
    user,
    displayName: user === 'admin1' ? 'Quản trị viên (Tước)' : 'Quản trị viên (Lập)',
    hotline: user === 'admin1' ? '0796 785 151' : '0967 611 112',
  })
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'Thử lại sau vài phút.' }, { status: 429 })
  }

  let username = ''
  let password = ''
  try {
    const body = await request.json()
    username = typeof body?.username === 'string' ? body.username.trim() : ''
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 })
  }

  if (!passwordMatches(password, username)) {
    return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }, { status: 401 })
  }

  const activeUser = username && ADMIN_USERS[username.toLowerCase()] ? username.toLowerCase() : 'admin'
  const res = NextResponse.json({ ok: true, user: activeUser })
  res.cookies.set(SESSION_COOKIE, createSessionToken(activeUser), sessionCookieOptions())
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0))
  return res
}
