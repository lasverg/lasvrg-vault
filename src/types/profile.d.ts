// Define the interface for the Profile document
import { Document } from 'mongoose'
import mongoose from 'mongoose'

export interface Link {
  platform: string
  url: string
}

export interface IProfile {
  _id?: mongoose.Types.ObjectId // same as user._id
  avatar?: string
  cover?: string
  bio: string
  links?: Link[]
}

export interface IProfileDocument extends IProfile, Document {
  createdAt: Date
  updatedAt: Date
}

// Types for profile operations (excluding avatar/cover as they're handled separately)
export interface IProfileCreate {
  bio: string
  links?: Link[]
}

export interface IProfileUpdate {
  bio?: string
  links?: Link[]
}
