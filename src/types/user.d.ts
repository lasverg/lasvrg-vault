import { Document } from 'mongoose'

export interface IUser {
  id?: string
  username: string
  email: string
  password: string
  firstname: string
  lastname: string
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export type User = Omit<IUserDocument, 'password' | 'comparePassword'>

// Authenticated user type (what req.user contains after authentication)
export interface IAuthenticatedUser extends Omit<IUser, 'password'> {
  id: string
}

export type TSigninUserWithEmail = Pick<IUser, 'email' | 'password'>
export type TSigninUserWithUsername = Pick<IUser, 'username' | 'password'>
