import {
  signinHandler,
  authCheckHandler,
  signoutHandler
} from '@/api/authenticate/authenticate.controller.js'
import { signinRequestValidator } from '@api/user/uservalidate.middleware.js'
import { Router } from 'express'

export default (router: Router) => {
  router.post('/auth/signin', signinRequestValidator, signinHandler)
  router.get('/auth/validate', authCheckHandler)
  router.post('/auth/signout', signoutHandler)
}
