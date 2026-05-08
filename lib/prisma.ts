import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const adapter = process.env.DATABASE_URL ? new PrismaPg(process.env.DATABASE_URL) : null

const clientOptions = {
  log: ['error'],
  ...(adapter ? { adapter } : {}),
} as unknown

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(clientOptions as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
