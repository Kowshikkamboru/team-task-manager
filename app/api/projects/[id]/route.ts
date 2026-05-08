import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, forbidden, notFound } from '@/lib/api-auth'

async function getMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } })
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const membership = await getMembership(params.id, user.id)
  if (!membership) return notFound('Project not found or access denied')

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!project) return notFound()

  return Response.json({
    project: {
      ...project,
      myRole: membership.role,
      members: project.members.map(m => ({ ...m.user, role: m.role })),
    },
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const membership = await getMembership(params.id, user.id)
  if (!membership) return notFound('Project not found')
  if (membership.role !== 'ADMIN') return forbidden()

  const { name, description } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })

  const project = await prisma.project.update({
    where: { id: params.id },
    data: { name: name.trim(), description: description?.trim() || null },
  })
  return Response.json({ project })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return notFound()
  if (project.ownerId !== user.id) return forbidden()

  await prisma.project.delete({ where: { id: params.id } })
  return Response.json({ success: true })
}
