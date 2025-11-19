import { Request, Response, ErrorRequestHandler, NextFunction } from 'express'
import { ValidationError } from 'yup'
import jwt from 'jsonwebtoken'
import { getValidationErrorsMessages } from './validation.error.js'
import { DbError } from './db.error.js'
import { AppErrorResponse } from './response.error.js'
import { AuthError } from './api.error.js'

export function appErrorHandler(
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errRes = {
    message: 'Internal Server Error',
    code: 500
  }

  switch (true) {
    case err instanceof AuthError:
      errRes.message = err.message
      errRes.code = err.code
      break
    case err instanceof jwt.TokenExpiredError:
      errRes.message = 'Session expired. Please log in again.'
      errRes.code = 440
      break
    case err instanceof DbError:
      errRes.message = err.messages
      errRes.code = 409
      // errRes.field = err.field
      break
    case err instanceof ValidationError:
      const messages = getValidationErrorsMessages(err as ValidationError)
      // @ts-ignore
      errRes.message = messages
      errRes.code = 406
      break
    default:
      console.error(err) // Log the error for debugging
  }

  const errorResponse = new AppErrorResponse(errRes.message, errRes.code)

  res.status(errRes.code).json({ ...errorResponse })
}
