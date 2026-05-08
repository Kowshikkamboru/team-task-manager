import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email?.trim() || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || !(await comparePassword(password, user.password))) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signToken({ id: user.id, email: user.email, name: user.name })
    cookies().set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/' })

    return Response.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
