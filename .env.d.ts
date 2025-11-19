declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      NODE_ENV: 'development' | 'production'
      BASE_URL: string
      PB_URL: string
      DB_URI: string
      SALT_FACTOR: number
      ACCESS_TOKEN_TIME_TO_LIVE: string
      REFRESH_TOKEN_TIME_TO_LIVE: string
      TOKEN_ISSUER: string
      AUDIENCE: string
      ALGORITHEM: string
    }
  }
}
