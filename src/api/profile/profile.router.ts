import { Router } from 'express'
import {
  addUserProfileController,
  updateUserProfileController,
  getUserProfileController,
  getMyProfileController
  // uploaderController
} from './profile.controller.js'
import {
  profileCreateValidator,
  profileUpdateValidator
} from './profile.middleware.js'

export default (router: Router) => {
  // Public endpoint - view any user's profile (no auth required)
  router.get('/profiles/:username', getUserProfileController)

  // Private endpoints - manage own profile (auth required)
  router.get('/profile', getMyProfileController)
  router.post('/profile', profileCreateValidator, addUserProfileController)
  router.put('/profile', profileUpdateValidator, updateUserProfileController)
  // router.put('/user/upload/:type', uploaderController) // for avatar/cover uploads
}
