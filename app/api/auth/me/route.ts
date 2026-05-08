import { getCurrentUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const payload = await getCurrentUser()
  if (!payload) return Response.json({ user: null }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  return Response.json({ user })
}
