import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, forbidden, notFound, badRequest } from '@/lib/api-auth'

export async function DELETE(_: NextRequest, { params }: { params: { id: string; userId: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const myMembership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: user.id } },
  })
  if (!myMembership) return notFound('Project not found')
  if (myMembership.role !== 'ADMIN') return forbidden()

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return notFound()
  if (project.ownerId === params.userId) return badRequest('Cannot remove the project owner')

  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: params.userId } },
  })
  if (!target) return notFound('Member not found')

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId: params.id, userId: params.userId } },
  })

  return Response.json({ success: true })
}
