import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name?.trim() || !email?.trim() || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return Response.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase(), password: await hashPassword(password) },
    })

    const token = await signToken({ id: user.id, email: user.email, name: user.name })
    cookies().set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/' })

    return Response.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
