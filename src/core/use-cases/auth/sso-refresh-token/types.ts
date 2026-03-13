export interface SSORefreshTokenUseCasePayload {
  refresh_token: string
}

export interface SSORefreshTokenUseCaseReturn {
  access_token: string
  access_token_expires_at: Date
}
