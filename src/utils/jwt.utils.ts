// import { readFileSync } from 'fs'
// import { join, resolve } from 'path'
// import { SignJWT, importPKCS8, jwtVerify } from 'jose'

import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'

import { getPrivateSecret, getPublicSecret } from '@/certs/index.js'

config()

const privateKey = getPrivateSecret() || ''
const publicKey = getPublicSecret() || ''

const TOKEN_ISSUER = process.env.TOKEN_ISSUER || 'Lasverg Inc.'
const ALGORITHM = process.env.ALGORITHM || 'RS256'
const AUDIENCE = process.env.AUDIENCE || 'https://lasverg.io'

const attl = process.env.ACCESS_TOKEN_TIME_TO_LIVE || '1h'
const rttl = process.env.REFRESH_TOKEN_TIME_TO_LIVE || '1d'

const jwtOptions = {
  algorithm: ALGORITHM,
  issuer: TOKEN_ISSUER,
  audience: AUDIENCE,
  expiresIn: attl
}

class JWT {
  async signToken(data: object) {
    const token = jwt.sign({ data }, privateKey, jwtOptions as SignOptions)

    return token
  }
  async signRefreshToken(sessionId: string) {
    const data = { session: sessionId }
    const token = jwt.sign(data, privateKey, {
      ...jwtOptions,
      expiresIn: rttl
    } as SignOptions)

    return token
  }

  // decode<T>(token: string): T {
  //   return {} as T
  // }

  verifyToken(token: string) {
    try {
      const decode = jwt.verify(token, publicKey, jwtOptions)
      if (decode) {
        return decode
      }
    } catch (error) {
      throw error
    }
  }
}

export default new JWT()
