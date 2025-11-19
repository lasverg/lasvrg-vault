import 'dotenv/config'
import log from '@logger'
import connect from '@/db/connect.js'
import { ensureProfilesForExistingUsers } from '@/jobs/ensure-profiles.job.js'

async function main() {
  try {
    await connect()
    await ensureProfilesForExistingUsers()
    log.info('[profiles:backfill] Done')
    process.exit(0)
  } catch (err) {
    log.error({ err }, '[profiles:backfill] Failed')
    process.exit(1)
  }
}

export async function bootstrap() {
  try {
    // ...existing code (connect DB, start app)...
    // After DB is connected and before/after server starts (your choice)
    if (process.env.BACKFILL_PROFILES_ON_BOOT === 'true') {
      ensureProfilesForExistingUsers().catch(err => {
        // Do not crash the server; just log
        // If you prefer hard-fail, rethrow instead.
        // eslint-disable-next-line no-console
        console.error('[profiles:backfill] Failed:', err)
      })
    }
    // ...existing code...
  } catch (err) {
    // ...existing code...
  }
}

// main()
