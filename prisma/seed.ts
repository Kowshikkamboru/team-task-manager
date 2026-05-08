import { PrismaClient, Role, TaskStatus, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Alex Admin',
      email: 'admin@demo.com',
      password: await bcrypt.hash('password123', 10),
    },
  })

  const memberUser = await prisma.user.upsert({
    where: { email: 'member@demo.com' },
    update: {},
    create: {
      name: 'Morgan Member',
      email: 'member@demo.com',
      password: await bcrypt.hash('password123', 10),
    },
  })

  // Create a project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Full redesign of the company website with modern UI/UX',
      ownerId: adminUser.id,
      members: {
        create: [
          { userId: adminUser.id, role: Role.ADMIN },
          { userId: memberUser.id, role: Role.MEMBER },
        ],
      },
    },
  })

  // Create tasks
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  await prisma.task.createMany({
    data: [
      {
        title: 'Design new homepage mockup',
        description: 'Create wireframes and mockups for the new homepage design',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        projectId: project.id,
        assigneeId: memberUser.id,
        creatorId: adminUser.id,
        dueDate: yesterday,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated deployment',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        projectId: project.id,
        assigneeId: adminUser.id,
        creatorId: adminUser.id,
        dueDate: tomorrow,
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST endpoints using OpenAPI/Swagger',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        projectId: project.id,
        assigneeId: memberUser.id,
        creatorId: adminUser.id,
        dueDate: tomorrow,
      },
      {
        title: 'Fix mobile responsiveness',
        description: 'Fix layout issues on small screen devices',
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        projectId: project.id,
        assigneeId: null,
        creatorId: adminUser.id,
      },
    ],
  })

  console.log('✅ Seed complete')
  console.log('Admin: admin@demo.com / password123')
  console.log('Member: member@demo.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
