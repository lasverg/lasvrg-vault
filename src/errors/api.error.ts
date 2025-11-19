export class AuthError extends Error {
  code: number
  constructor(message: string = 'Unauthorized access', code: number = 401) {
    super(message)
    this.code = code // Unauthorized
  }
}
