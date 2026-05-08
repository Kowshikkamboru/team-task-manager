import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, forbidden, notFound } from '@/lib/api-auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return notFound('Task not found')

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: user.id } },
  })
  if (!membership) return forbidden()

  const body = await req.json()
  const { status, title, description, priority, dueDate, assigneeId } = body

  // Members can only update status; Admins can update all fields
  if (membership.role === 'MEMBER') {
    if (!status) return forbidden()
    const updated = await prisma.task.update({
      where: { id: params.id },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    })
    return Response.json({ task: updated })
  }

  // Admin: update any field
  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
    },
    include: {
      assignee: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  })

  return Response.json({ task: updated })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return notFound('Task not found')

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: user.id } },
  })
  if (!membership || membership.role !== 'ADMIN') return forbidden()

  await prisma.task.delete({ where: { id: params.id } })
  return Response.json({ success: true })
}
