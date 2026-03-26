export interface UserClaims {
  id: string
  email: string
  jti: string
  sub: string
  iat: number
  role: string
  exp: number
}

export interface CreateTokenResult {
  token: string
  claims: UserClaims
}
