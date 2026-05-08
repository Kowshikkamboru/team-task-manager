import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, forbidden, notFound, badRequest } from '@/lib/api-auth'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: user.id } },
  })
  if (!membership) return notFound('Project not found or access denied')

  const tasks = await prisma.task.findMany({
    where: { projectId: params.id },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ tasks })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: user.id } },
  })
  if (!membership) return notFound('Project not found')
  if (membership.role !== 'ADMIN') return forbidden()

  const { title, description, priority, dueDate, assigneeId } = await req.json()
  if (!title?.trim()) return badRequest('Task title is required')

  if (assigneeId) {
    const assigneeMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: params.id, userId: assigneeId } },
    })
    if (!assigneeMember) return badRequest('Assignee must be a member of this project')
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId: params.id,
      creatorId: user.id,
      assigneeId: assigneeId || null,
    },
    include: {
      assignee: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  })

  return Response.json({ task }, { status: 201 })
}
