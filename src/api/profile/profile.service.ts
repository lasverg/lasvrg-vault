import {
  IProfileDocument,
  IProfileCreate,
  IProfileUpdate
} from '@/types/profile.js'
import Profile from './profile.model.js'
import { Schema } from 'mongoose'
import { AuthError } from '@/errors/api.error.js'

export async function createProfile(
  userId: Schema.Types.ObjectId,
  profileData: IProfileCreate
): Promise<IProfileDocument> {
  try {
    // Check if profile already exists for this user
    const existingProfile = await Profile.findById(userId)
    if (existingProfile) {
      throw new AuthError('Profile already exists for this user', 409)
    }

    const newProfile = new Profile({
      _id: userId,
      ...profileData
    })

    return await newProfile.save()
  } catch (error) {
    throw error
  }
}

export async function getUserProfile(
  userId: string
): Promise<IProfileDocument | null> {
  try {
    const profile = await Profile.findById(userId)
    return profile
  } catch (error) {
    throw error
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: IProfileUpdate
): Promise<IProfileDocument | null> {
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      profileData,
      {
        new: true, // Return the updated document
        runValidators: true // Run mongoose schema validations
      }
    )

    if (!updatedProfile) {
      throw new AuthError('Profile not found', 404)
    }

    return updatedProfile
  } catch (error) {
    throw error
  }
}

export async function checkProfileExists(userId: string): Promise<boolean> {
  try {
    const profile = await Profile.findById(userId).select('_id')
    return !!profile
  } catch (error) {
    throw error
  }
}
