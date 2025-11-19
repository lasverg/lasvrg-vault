import { IProfileDocument } from '@/types/profile.js'
import mongoose, { InferSchemaType, Schema } from 'mongoose'

const linkSchema = new mongoose.Schema(
  {
    platform: String,
    url: String
  },
  { _id: false }
)

// Create the schema
const ProfileSchema: Schema = new Schema<IProfileDocument>(
  {
    _id: Schema.Types.ObjectId, // same as user._id
    avatar: { type: String },
    cover: { type: String },
    bio: { type: String, required: true },
    links: [linkSchema]
  },
  {
    timestamps: true,
    _id: false
  }
)
//
// Export the model
const Profile = mongoose.model<IProfileDocument>('Profile', ProfileSchema)

export type IProfileDoc = InferSchemaType<typeof ProfileSchema>

export default Profile
