import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, forbidden, notFound, badRequest } from '@/lib/api-auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: user.id } },
  })
  if (!membership) return notFound('Project not found')
  if (membership.role !== 'ADMIN') return forbidden()

  const { email, role } = await req.json()
  if (!email?.trim()) return badRequest('Email is required')
  if (!['ADMIN', 'MEMBER'].includes(role)) return badRequest('Role must be ADMIN or MEMBER')

  const targetUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!targetUser) return notFound('No user found with that email address')

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: targetUser.id } },
  })
  if (existing) return badRequest('This user is already a member of the project')

  const member = await prisma.projectMember.create({
    data: { projectId: params.id, userId: targetUser.id, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return Response.json({ member: { ...member.user, role: member.role } }, { status: 201 })
}
