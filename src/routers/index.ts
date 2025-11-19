import { Router } from 'express'

import users from '@api/user/user.router.js'
import authentication from '@api/authenticate/authenticate.router.js'
import profile from '@api/profile/profile.router.js'

//A router in Express is a middleware that allows you to group related
//routes together and manage their behavior separately from the main application.
const router = Router()

export default (): Router => {
  authentication(router)
  users(router)
  profile(router)
  // links

  return router
}
