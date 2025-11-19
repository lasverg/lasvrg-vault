import { IProtectedRequest } from '@/types/index.js'
import { NextFunction, Request, Response } from 'express'
import { MongoServerError } from 'mongodb'
import {
  createProfile,
  getUserProfile,
  updateUserProfile,
  checkProfileExists
} from './profile.service.js'
import { IProfileCreate, IProfileUpdate } from '@/types/profile.js'
import { AuthError } from '@/errors/api.error.js'
import { DbError } from '@/errors/db.error.js'
import { Schema } from 'mongoose'
import omit from 'lodash/omit.js'
import { getUserByUsername } from '@api/user/user.service.js'

export async function getUserProfileController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params

    if (!username) {
      next(new AuthError('Username is required', 400))
      return
    }

    // Get user by username
    const user = await getUserByUsername(username)
    const userId = user.id || user._id?.toString()

    if (!userId) {
      next(new AuthError('User ID not found', 500))
      return
    }

    const profile = await getUserProfile(userId)

    if (!profile) {
      next(new AuthError('Profile not found', 404))
      return
    }

    // Return profile data without internal fields
    const profileData = omit(profile.toJSON(), '__v')

    res.status(200).json({
      success: true,
      data: profileData
    })
  } catch (error) {
    if (error instanceof MongoServerError) {
      next(new DbError(error))
      return
    }
    next(error)
  }
}

export async function getMyProfileController(
  req: IProtectedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authenticatedUserId = req.user?.id

    if (!authenticatedUserId) {
      next(new AuthError('Authentication required', 401))
      return
    }

    const profile = await getUserProfile(authenticatedUserId)

    if (!profile) {
      next(new AuthError('Profile not found', 404))
      return
    }

    // Return profile data without internal fields
    const profileData = omit(profile.toJSON(), '__v')

    res.status(200).json({
      success: true,
      data: profileData
    })
  } catch (error) {
    if (error instanceof MongoServerError) {
      next(new DbError(error))
      return
    }
    next(error)
  }
}

export async function addUserProfileController(
  req: IProtectedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authenticatedUserId = req.user?.id
    const profileData: IProfileCreate = req.body

    if (!authenticatedUserId) {
      next(new AuthError('Authentication required', 401))
      return
    }

    const newProfile = await createProfile(
      new Schema.Types.ObjectId(authenticatedUserId),
      profileData
    )

    const responseData = omit(newProfile.toJSON(), '__v')

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: responseData
    })
  } catch (error) {
    if (error instanceof MongoServerError) {
      next(new DbError(error))
      return
    }
    next(error)
  }
}

export async function updateUserProfileController(
  req: IProtectedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authenticatedUserId = req.user?.id
    const profileData: IProfileUpdate = req.body

    if (!authenticatedUserId) {
      next(new AuthError('Authentication required', 401))
      return
    }

    const updatedProfile = await updateUserProfile(
      authenticatedUserId,
      profileData
    )

    const responseData = omit(updatedProfile?.toJSON(), '__v')

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: responseData
    })
  } catch (error) {
    if (error instanceof MongoServerError) {
      next(new DbError(error))
      return
    }
    next(error)
  }
}

// Placeholder for upload controller (avatar/cover images)
// export async function uploaderController(
//   req: IProtectedRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   // This will handle avatar and cover image uploads separately
//   // Implementation depends on your file upload strategy (multer, cloud storage, etc.)
//   res.json({ message: 'Upload endpoint - to be implemented' })
// }
