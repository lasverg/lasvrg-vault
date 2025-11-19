// import { config } from 'dotenv'
// import { getPrivateSecret, getPublicSecret } from '@/certs/index.js'
// import { KeyLike, SignJWT, jwtVerify } from 'jose'
// config()

// const TOKEN_ISSUER = process.env.TOKEN_ISSUER || ''
// const ALGORITHEM = process.env.ALGORITHEM || 'RS256'
// const AUDIENCE = process.env.AUDIENCE || ''

// const attl = process.env.ACCESS_TOKEN_TIME_TO_LIVE || '1h'
// const rttl = process.env.REFRESH_TOKEN_TIME_TO_LIVE || '1d'

// class Jose {
//   pvtKey: KeyLike | string = ''
//   pubKey: KeyLike | string = ''
//   constructor() {
//     this.getKeys()
//   }

//   async getKeys() {
//     this.pvtKey = await getPrivateSecret(ALGORITHEM)
//     this.pubKey = await getPublicSecret(ALGORITHEM)
//   }

//   async signToken(data: object) {
//     return new SignJWT({ data })
//       .setProtectedHeader({ alg: ALGORITHEM })
//       .setIssuedAt()
//       .setIssuer(TOKEN_ISSUER)
//       .setAudience(AUDIENCE)
//       .setExpirationTime(attl)
//       .sign(this.pvtKey as KeyLike)
//   }

//   async signRefreshToken(data: object) {
//     return new SignJWT({ data })
//       .setProtectedHeader({ alg: ALGORITHEM })
//       .setIssuedAt()
//       .setIssuer(TOKEN_ISSUER)
//       .setAudience(AUDIENCE)
//       .setExpirationTime(rttl)
//       .sign(this.pvtKey as KeyLike)
//   }

//   async verifyToken(token: string) {
//     return await jwtVerify(token, this.pubKey as KeyLike, {
//       issuer: TOKEN_ISSUER,
//       audience: AUDIENCE
//     })
//   }
// }

// export default new Jose()
