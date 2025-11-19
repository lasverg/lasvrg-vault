import { Response, NextFunction } from 'express'
import jwt from '@utils/jwt.utils.js'
import { AuthError } from '@errors/api.error.js'
import { IProtectedRequest } from '@/types/index.js'
import { IAuthenticatedUser } from '@/types/user.js'
import { getSession } from '@api/authenticate/session.service.js'

export async function isAuthenticate(
  req: IProtectedRequest,
  _res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers

  if (!authorization) {
    return next(new AuthError())
  }
  // extract token
  const token = authorization?.replace('Bearer ', '')

  try {
    const decode = jwt.verifyToken(token)
    req.user = decode as IAuthenticatedUser
    return next()
  } catch (err) {
    next(err)
  }
}

export async function cookieAuth(
  req: IProtectedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { accessToken, refreshToken } = (req as any).cookies || {}

    // If no tokens present, return unauthorized
    if (!accessToken && !refreshToken) {
      return next(new AuthError())
    }

    // First try to validate the access token
    if (accessToken) {
      try {
        const decoded = jwt.verifyToken(accessToken) as any
        req.user = decoded.data as IAuthenticatedUser
        return next()
      } catch (error) {
        // Access token is invalid/expired, try refresh token
        console.log('Access token expired or invalid, trying refresh token')
      }
    }

    // Try to use refresh token to generate new access token
    if (refreshToken) {
      try {
        const decoded = jwt.verifyToken(refreshToken) as any

        // Verify session is still valid
        const session = await getSession(decoded.session)
        if (!session || !session.valid) {
          return next(new AuthError())
        }

        // Get user from session and set in request
        req.user = session.user as IAuthenticatedUser

        // Generate new access token
        const newAccessToken = await jwt.signToken({
          user: session.user
        } as object)

        // Set new access token as cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 // 1 hour
        })

        return next()
      } catch (error) {
        return next(new AuthError())
      }
    }

    return next(new AuthError())
  } catch (error) {
    next(error)
  }
}
