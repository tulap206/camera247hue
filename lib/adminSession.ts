import { createHmac, timingSafeEqual, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const SESSION_COOKIE = 'c247_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export const ADMIN_USERS: Record<string, string> = {
  admin: process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET || 'Tulap@206c',
  admin1: process.env.ADMIN1_PASSWORD || 'Top@123',
}

export function getAdminPassword(username = 'admin') {
  return ADMIN_USERS[username] || ADMIN_USERS.admin
}

function signingKey() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'camera247-session-key'
  )
}

function hmac(value: string) {
  return createHmac('sha256', signingKey()).update(value).digest('hex')
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

export function createSessionToken(username = 'admin') {
  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const nonce = randomBytes(16).toString('hex')
  const payload = `${exp}.${nonce}.${username}`
  return `${payload}.${hmac(payload)}`
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 4 && parts.length !== 3) return false
  
  if (parts.length === 4) {
    const [exp, nonce, username, sig] = parts
    if (!exp || !nonce || !username || !sig) return false
    const payload = `${exp}.${nonce}.${username}`
    if (!safeEqual(hmac(payload), sig)) return false
    if (Number(exp) < Date.now()) return false
    return true
  }

  // Backward compatibility with 3-part tokens
  const [exp, nonce, sig] = parts
  if (!exp || !nonce || !sig) return false
  const payload = `${exp}.${nonce}`
  if (!safeEqual(hmac(payload), sig)) return false
  if (Number(exp) < Date.now()) return false
  return true
}

export function verifyAdminCredentials(username: unknown, password: unknown) {
  if (typeof password !== 'string' || password.length === 0 || password.length > 200) {
    return false
  }

  const u = typeof username === 'string' ? username.trim().toLowerCase() : ''
  
  if (u && ADMIN_USERS[u]) {
    const expected = ADMIN_USERS[u]
    return safeEqual(hmac(`pw:${password}`), hmac(`pw:${expected}`))
  }

  // If username is not passed or empty, check all valid admin accounts
  for (const expected of Object.values(ADMIN_USERS)) {
    if (safeEqual(hmac(`pw:${password}`), hmac(`pw:${expected}`))) {
      return true
    }
  }

  return false
}

export function passwordMatches(password: unknown, username?: unknown) {
  return verifyAdminCredentials(username, password)
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
