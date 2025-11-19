import { Router } from 'express'
import { userRequestValidator } from '@api/user/uservalidate.middleware.js'
import { createUserHandler } from '@api/user/user.controller.js'

export default (router: Router) => {
  router.post('/user/register', userRequestValidator, createUserHandler)
  // router.get('/user/profile') // profile controller
}
