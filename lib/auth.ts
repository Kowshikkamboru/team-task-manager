import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-dev-key-change-in-production'
)

export type JwtPayload = {
  id: string
  email: string
  name: string
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const { hash } = await import('bcryptjs')
  return hash(password, 10)
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  const { compare } = await import('bcryptjs')
  return compare(plain, hashed)
}
