#!/usr/bin/env node
const { spawnSync } = require('child_process')

function log(...args) {
  console.log('[seed-if-needed]', ...args)
}

const railwayEnv = process.env.RAILWAY_ENV
const seedDone = process.env.SEED_DONE

if (railwayEnv !== 'production') {
  log(`Skipping seed because RAILWAY_ENV=${railwayEnv}`)
  process.exit(0)
}

if (seedDone === 'true') {
  log('Skipping seed because SEED_DONE=true')
  process.exit(0)
}

log('Running seed because RAILWAY_ENV=production and SEED_DONE!=true')

const res = spawnSync('npx', ['tsx', 'prisma/seed.ts'], { stdio: 'inherit' })
if (res.error) {
  console.error(res.error)
  process.exit(1)
}
if (res.status !== 0) process.exit(res.status)

log('Seed finished successfully.')
console.log('IMPORTANT: set SEED_DONE=true in Railway project variables to avoid re-seeding on future deploys.')

process.exit(0)
