import { createHmac, timingSafeEqual, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const SESSION_COOKIE = 'c247_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export function getAdminPassword() {
  return process.env.ADMIN_SECRET?.trim() || ''
}

function signingKey() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || ''
}

function hmac(value: string, key: string) {
  return createHmac('sha256', key).update(value).digest('hex')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}

export function createSessionToken() {
  const key = signingKey()
  if (!key) {
    throw new Error('ADMIN_SESSION_SECRET is required for admin sessions')
  }

  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const nonce = randomBytes(16).toString('hex')
  const payload = `${exp}.${nonce}`
  return `${payload}.${hmac(payload, key)}`
}

export function verifySessionToken(token: string | undefined | null) {
  const key = signingKey()
  if (!key) return false

  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [exp, nonce, sig] = parts
  if (!exp || !nonce || !sig) return false
  const payload = `${exp}.${nonce}`
  if (!safeEqual(hmac(payload, key), sig)) return false
  if (Number(exp) < Date.now()) return false
  return true
}

export function passwordMatches(password: unknown) {
  if (typeof password !== 'string' || password.length === 0 || password.length > 200) {
    return false
  }
  const expected = getAdminPassword()
  if (!expected) return false
  return safeEqual(password, expected)
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function isAdminSession() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function requireAdmin() {
  if (!isAdminSession()) return unauthorized()
  return null
}
