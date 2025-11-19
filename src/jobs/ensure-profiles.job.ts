import log from '@logger'
import User from '@/api/user/user.model.js'
import Profile from '@/api/profile/profile.model.js'

function defaultBio(u: {
  firstname?: string
  lastname?: string
  username?: string
}) {
  const name =
    [u?.firstname, u?.lastname].filter(Boolean).join(' ') ||
    u?.username ||
    'there'
  return `Hello! I'm ${name}.`
}

export async function ensureProfilesForExistingUsers(): Promise<void> {
  const startedAt = Date.now()
  log.info(
    '[profiles:backfill] Starting backfill for existing users without profiles'
  )

  // Get all user ids and names (lean for perf)
  const users = await User.find(
    {},
    { _id: 1, firstname: 1, lastname: 1, username: 1 }
  ).lean()
  if (!users.length) {
    log.info('[profiles:backfill] No users found. Skipping.')
    return
  }

  // Get users that already have a profile
  const existingProfileUserIds = await Profile.distinct('user')
  const existingSet = new Set(
    existingProfileUserIds.map((id: any) => String(id))
  )

  // Compute missing users
  const missing = users.filter(u => !existingSet.has(String(u._id)))
  if (!missing.length) {
    log.info(
      '[profiles:backfill] All users already have profiles. Nothing to do.'
    )
    return
  }

  // Prepare docs
  const docs = missing.map(u => ({
    user: u._id,
    bio: defaultBio(u),
    links: []
  }))

  // Insert in bulk (idempotent by selection)
  const result = await Profile.insertMany(docs, { ordered: false })
  const durationMs = Date.now() - startedAt
  log.info(
    `[profiles:backfill] Created ${result.length}/${missing.length} profiles in ${durationMs}ms`
  )
}
