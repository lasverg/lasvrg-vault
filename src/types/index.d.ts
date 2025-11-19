import { Request } from 'express'
import { IAuthenticatedUser } from './user.js'

export interface ClientInfo {
  agent: {
    browser: {
      name: string
      version: string
    }
    device: {
      name: string
      version: string
    }
    os: {
      name: string
      version: string
    }
  }
  ip: string
}

export interface IProtectedRequest extends Request {
  user?: IAuthenticatedUser
}

export interface ICookieRequest extends Request {
  cookies?: { [key: string]: string }
}
