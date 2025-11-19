import { NextFunction, Response } from 'express'
import { isAuthenticate } from '@api/authenticate/authenticate.middleware.js'
import { IProtectedRequest } from '@/types/index.js'

import excludedRoutes from '@constants/exclude-routes.js'

export const authMiddleware = (
  req: IProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  // Check if route is excluded
  const isExcluded = excludedRoutes.some(route => {
    if (typeof route === 'string') {
      return req.path === route
    }
    // Handle method-specific exclusions
    if (typeof route === 'object' && route.method && route.path) {
      // Check if path starts with the excluded path (to match /api/v1/profile/:username)
      return req.method === route.method && req.path.startsWith(route.path)
    }
    return false
  })

  if (isExcluded) {
    return next()
  }
  return isAuthenticate(req, res, next)
}
