import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'camera247hue_admin_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

function getSigningSecret(): string {
  return process.env.ADMIN_SECRET || 'camera247hue_admin_2024'
}

function sign(value: string): string {
  return createHmac('sha256', getSigningSecret()).update(value).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
}

function createSessionValue(): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'admin',
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    })
  ).toString('base64url')

  return `${payload}.${sign(payload)}`
}

function verifySessionValue(value: string | undefined): boolean {
  if (!value) return false

  const [payload, signature] = value.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return parsed?.sub === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function setAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  })
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export function requireAdminSession(): boolean {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value
  return verifySessionValue(sessionCookie)
}

export function unauthorizedAdminResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
