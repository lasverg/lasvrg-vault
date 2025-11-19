import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'
import { IUserDocument } from '@/types/user.js'

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      index: true,
      message: 'Username is already taken.'
    },
    email: { type: String, require: true, unique: true, lowerCase: true },
    password: { type: String, require: true },
    firstname: { type: String, require: true },
    lastname: { type: String, require: true }
  },
  {
    timestamps: true
  }
)

UserSchema.pre('save', async function (next) {
  // @ts-ignore
  const user = this as IUserDocument

  // check if password is has been modified or is new
  if (!user.isModified('password')) return next()

  const saltKey = parseInt(process.env.SALT_FACTOR as string) || 9

  const salt = await bcrypt.genSalt(saltKey)

  const hash = await bcrypt.hash(user.password, salt)

  user.password = hash

  return next()
})

UserSchema.methods.comparePassword = async function (password: string) {
  const user = this as IUserDocument

  return await bcrypt.compare(password, user.password)
}

// add custom indexing
// UserSchema.index({ username: 1, email: 1 }, { unique: true });

const User = model<IUserDocument>('User', UserSchema)

export default User
