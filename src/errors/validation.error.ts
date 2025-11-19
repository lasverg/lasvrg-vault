import { ValidationError } from 'yup'

export const getValidationErrorsMessages = (
  validationError: ValidationError
): Record<string, string> => {
  const errorMessages: Record<string, string> = {}

  for (const { path, message } of validationError.inner) {
    if (!errorMessages[`${path}`]) {
      errorMessages[`${path}`] = message
    }
  }

  return errorMessages
}
