import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function shouldUseAdapter(): boolean {
  // Explicit opt-in via PRISMA_USE_ADAPTER=true
  if (process.env.PRISMA_USE_ADAPTER === 'true') return true
  // Enable by default in production when a DATABASE_URL is present
  if (process.env.NODE_ENV === 'production' && !!process.env.DATABASE_URL) return true
  return false
}

let adapter: PrismaPg | undefined
if (shouldUseAdapter() && process.env.DATABASE_URL) {
  try {
    // Instantiate adapter only when explicitly enabled or in production.
    adapter = new PrismaPg(process.env.DATABASE_URL)
  } catch (err) {
    // Don't crash the app — fall back to the default Prisma client.
    // Log a warning so the issue is visible in logs.
    // eslint-disable-next-line no-console
    console.warn('Prisma adapter initialization failed; falling back to default client.', err)
    adapter = undefined
  }
}

const clientOptions: any = {
  log: ['error'],
  ...(adapter ? { adapter } : {}),
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(clientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
