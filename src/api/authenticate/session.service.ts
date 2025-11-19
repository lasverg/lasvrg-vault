import { ISession } from '@/types/session.js'
import Session from './session.model.js'

export async function createSession(session: ISession) {
  try {
    return await Session.create(session)
  } catch (error) {
    throw error
  }
}

export async function getSession(sessionId: string) {
  try {
    return await Session.findOne({ _id: sessionId })
  } catch (error) {
    throw error
  }
}

export async function removeSession(sessionId: string) {
  try {
    return await Session.deleteOne({ _id: sessionId })
  } catch (error) {
    throw error
  }
}
