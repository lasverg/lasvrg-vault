import { object, string, array, InferType } from 'yup'
import { IProfileCreate, IProfileUpdate } from '@/types/profile.js'

const URL =
  /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i

// Link schema validation
const LinkSchema = object({
  platform: string()
    .required('Platform is required')
    .min(2, 'Platform must be at least 2 characters')
    .max(50, 'Platform must not exceed 50 characters'),
  url: string().required('URL is required').matches(URL, 'Enter a valid URL')
})

// Profile creation validation (POST) - bio is required
const ProfileCreateSchema = object({
  bio: string()
    .required('Bio is required')
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must not exceed 500 characters'),
  links: array().of(LinkSchema).max(10, 'Maximum 10 links allowed').optional()
})

// Profile update validation (PUT) - all fields optional
const ProfileUpdateSchema = object({
  bio: string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  links: array().of(LinkSchema).max(10, 'Maximum 10 links allowed').optional()
})

// Type exports
export type TProfileCreate = InferType<typeof ProfileCreateSchema>
export type TProfileUpdate = InferType<typeof ProfileUpdateSchema>

// Validation functions
export const validateProfileCreate = async (data: IProfileCreate) => {
  try {
    const isValid = await ProfileCreateSchema.validate(data, {
      abortEarly: false
    })
    return !!isValid
  } catch (error) {
    throw error
  }
}

export const validateProfileUpdate = async (data: IProfileUpdate) => {
  try {
    const isValid = await ProfileUpdateSchema.validate(data, {
      abortEarly: false
    })
    return !!isValid
  } catch (error) {
    throw error
  }
}
