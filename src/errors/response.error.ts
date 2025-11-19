type ResMessage = string | Record<string, string> | Record<string, string>[]

export interface IErrorResponse {
  message: ResMessage
  code: number | string | undefined
}

export class AppErrorResponse {
  errorResponse: IErrorResponse

  constructor(message: ResMessage, code: number | string | undefined) {
    this.errorResponse = {
      code,
      message
    }
  }
}
