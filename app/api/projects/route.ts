import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, badRequest } from '@/lib/api-auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: {
          _count: { select: { members: true, tasks: true } },
          tasks: { select: { status: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })

  const projects = memberships.map(m => ({
    id: m.project.id,
    name: m.project.name,
    description: m.project.description,
    createdAt: m.project.createdAt,
    myRole: m.role,
    memberCount: m.project._count.members,
    taskCount: m.project._count.tasks,
    doneCount: m.project.tasks.filter(t => t.status === 'DONE').length,
  }))

  return Response.json({ projects })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const { name, description } = await req.json()
  if (!name?.trim()) return badRequest('Project name is required')

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      ownerId: user.id,
      members: { create: { userId: user.id, role: 'ADMIN' } },
    },
  })

  return Response.json({ project }, { status: 201 })
}
