import { object, string, InferType, ref } from 'yup'
// import { getValidationErrors } from './error.js'
import log from '@/logger/index.js'

const password = string()
  .required()
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one symbol'
  )
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')

const UserValidationSchema = object({
  email: string().email('Invalid Email! Please enter valid email.').required(),
  username: string().min(4).max(16).required(),
  firstname: string().min(4).max(16).required(),
  lastname: string().max(16).required(),
  password,
  confirmPassword: string()
    .oneOf([ref('password')], 'Passwords must match')
    .required('Confirm password is required')
})

const SigninWithEmailValidationSchema = object({
  email: string()
    .required('Required Field')
    .test('is-email', 'Invalid email', (value: string) => {
      if (value) {
        return value.includes('@') ? string().email().isValidSync(value) : true
      }
      return true
    }), //string().email('Invalid Email! Please enter valid email.').required(),
  password
})
const SigninWithUsernameValidationSchema = object({
  username: string().min(4).max(16).required(),
  password: string()
    .required()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one symbol'
    )
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
})

type TUser = InferType<typeof UserValidationSchema>
export type TSigninWithEmail = InferType<typeof SigninWithEmailValidationSchema>
export type TSigninWithUsername = InferType<
  typeof SigninWithUsernameValidationSchema
>

export const validateNewUser = async (data: TUser) => {
  try {
    const isValidBody = await UserValidationSchema.validate(data, {
      abortEarly: false
    })
    return !!isValidBody
  } catch (error) {
    throw error
  }
}

export const validateSigninWithEmail = async (data: TSigninWithEmail) => {
  try {
    const isValidBody = await UserValidationSchema.validate(data, {
      abortEarly: false
    })
    return !!isValidBody
  } catch (error) {
    throw error
  }
}

export const validateSigninWithUsername = async (data: TSigninWithUsername) => {
  try {
    const isValidBody = await SigninWithUsernameValidationSchema.validate(
      data,
      {
        abortEarly: false
      }
    )
    return !!isValidBody
  } catch (error) {
    throw error
  }
}

// blob:https://x.com/6c7b7ef5-fa31-4ae6-ae7b-19f22332d3e6
