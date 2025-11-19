import { NextFunction, Response } from 'express'
import { IProtectedRequest } from '@/types/index.js'
import { AppErrorResponse } from '@/errors/response.error.js'
import {
  validateProfileCreate,
  validateProfileUpdate,
  TProfileCreate,
  TProfileUpdate
} from './profile.validator.js'

export const profileCreateValidator = async (
  req: IProtectedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profileData = req.body as TProfileCreate

    // Validate the profile data
    const isValid = await validateProfileCreate(profileData)

    if (isValid) {
      next()
      return
    }
  } catch (error) {
    next(error)
  }
}

export const profileUpdateValidator = async (
  req: IProtectedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profileData = req.body as TProfileUpdate

    // Check if at least one field is provided for update
    if (!profileData.bio && !profileData.links) {
      throw new AppErrorResponse(
        'At least one field (bio or links) must be provided for update',
        400
      )
    }

    // Validate the profile data
    const isValid = await validateProfileUpdate(profileData)

    if (isValid) {
      next()
      return
    }
  } catch (error) {
    next(error)
  }
}
