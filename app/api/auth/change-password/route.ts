import { NextResponse } from 'next/server'
import {
  isAdminSession,
  requireAdmin,
  passwordMatches,
  ADMIN_USERS,
} from '@/lib/adminSession'

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { oldPassword, newPassword, username } = body

    const userKey = typeof username === 'string' && username.trim().toLowerCase() === 'admin1' ? 'admin1' : 'admin'

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Thiếu thông tin mật khẩu.' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }, { status: 400 })
    }

    // Verify old password
    if (!passwordMatches(oldPassword, userKey)) {
      return NextResponse.json({ error: 'Mật khẩu cũ không chính xác.' }, { status: 401 })
    }

    // Update in-memory password for the process runtime
    ADMIN_USERS[userKey] = newPassword

    return NextResponse.json({ ok: true, message: 'Đổi mật khẩu thành công.' })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ khi đổi mật khẩu.' }, { status: 500 })
  }
}
