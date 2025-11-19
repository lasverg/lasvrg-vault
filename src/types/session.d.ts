import { Document } from 'mongoose'
import { IUserDocument } from '@/types/user.js'

export interface ISession {
  user: IUserDocument['_id']
  valid: boolean
  userAgent: string
}

export interface ISessionDocument extends ISession, Document {}
