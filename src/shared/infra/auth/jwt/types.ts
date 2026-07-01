export interface UserClaims {
  email: string
  exp: number
  iat: number
  id: string
  jti: string
  role: string
  sub: string
}

export interface CreateTokenResult {
  claims: UserClaims
  token: string
}
