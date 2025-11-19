import { ISessionDocument } from '@/types/session.js'
import { model, Schema } from 'mongoose'

const SessionSchema = new Schema<ISessionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    valid: { type: Boolean, default: true },
    userAgent: { type: String }
  },
  { timestamps: true }
)

const Session = model<ISessionDocument>('Session', SessionSchema)

export default Session
