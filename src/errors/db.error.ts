import { MongoServerError } from 'mongodb'
import { Response } from 'express'
import { AppErrorResponse } from './response.error.js'
import log from '@/logger/index.js'

export class DbError extends MongoServerError {
  constructor(error: MongoServerError) {
    const err = error.errorResponse
    console.log(err)
    // const errmsg = error.errorResponse.errmsg
    //   ?.split(':')[0]
    //   .replace(' collection', '.')
    const field = Object.entries(err.keyValue)[0][0]
    super(error.errorResponse)
    this.code = err.code
    this.messages = `This ${field} is already exists.`
    this.field = field
  }

  get message(): string {
    return this.info.message || this.message
  }
}

export function dbErrorhandler(error: MongoServerError, res: Response) {
  log.error(error)
  const err = new DbError(error)
  return res.status(409).send(new AppErrorResponse(err.messages, err.code))
}
