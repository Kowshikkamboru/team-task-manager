import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.user.findFirst()
    console.log('✅ Connected')
  } catch (err) {
    console.error('❌ Prisma connection failed:')
    console.error(err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
