import { cookies } from 'next/headers'
import { verifyToken, JwtPayload } from './auth'

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden() {
  return Response.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
}

export function notFound(msg = 'Not found') {
  return Response.json({ error: msg }, { status: 404 })
}

export function badRequest(msg: string) {
  return Response.json({ error: msg }, { status: 400 })
}
