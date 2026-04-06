import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { CreateTokenResult, UserClaims } from './types'

export class JwtService {
  constructor(private readonly secretKey: string) {
    if (!secretKey) throw new Error('JWT secret key is required')
  }

  createToken(
    id: string,
    email: string,
    role: string,
    durationMs: number
  ): CreateTokenResult {
    const jti = randomUUID()
    const now = Math.floor(Date.now() / 1000)
    const exp = now + Math.floor(durationMs / 1000)

    const claims: UserClaims = {
      id,
      email,
      jti,
      sub: email,
      role: role,
      iat: now,
      exp
    }

    const token = jwt.sign(claims, this.secretKey)

    return { token, claims }
  }

  verifyToken(token: string): UserClaims {
    const decoded = jwt.verify(token, this.secretKey) as UserClaims

    console.log(token)

    console.log('DECODED TOKEN:', decoded)

    if (!decoded.id || !decoded.email) {
      throw new Error('Invalid token claims')
    }

    return decoded
  }
}

export const Duration = {
  minutes: (n: number) => n * 60 * 1000,
  hours: (n: number) => n * 60 * 60 * 1000,
  days: (n: number) => n * 24 * 60 * 60 * 1000
} as const
