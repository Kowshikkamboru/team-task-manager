import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized } from '@/lib/api-auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const now = new Date()

  // All tasks assigned to me
  const myTasks = await prisma.task.findMany({
    where: { assigneeId: user.id },
    include: { project: { select: { id: true, name: true } } },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    take: 20,
  })

  const stats = {
    total: myTasks.length,
    todo: myTasks.filter(t => t.status === 'TODO').length,
    inProgress: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: myTasks.filter(t => t.status === 'DONE').length,
    overdue: myTasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'DONE').length,
  }

  // My projects
  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: {
          _count: { select: { members: true, tasks: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
    take: 6,
  })

  const projects = memberships.map(m => ({
    id: m.project.id,
    name: m.project.name,
    myRole: m.role,
    taskCount: m.project._count.tasks,
    memberCount: m.project._count.members,
  }))

  return Response.json({ stats, myTasks, projects })
}
