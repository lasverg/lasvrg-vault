import { NextFunction, Request, Response } from 'express'
import _ from 'lodash'
import { MongoServerError } from 'mongodb'

import { createUser, findUser } from '@api/user/user.service.js'
import { DbError } from '@/errors/db.error.js'

export async function createUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body
    const user = await createUser(body)
    const resData = _.omit(user.toJSON(), 'password', '__v')
    res.json(resData)
  } catch (error) {
    const err = new DbError(error as MongoServerError)
    next(err)
  }
}

export async function getUserController(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body
    const user = await findUser(body)
  } catch (error) {
    const err = new DbError(error as MongoServerError)
    next(err)
  }
}
