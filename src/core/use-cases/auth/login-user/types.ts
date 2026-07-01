export interface LoginUserUseCasePayload {
  email: string
  password: string
}

export interface LoginUserUseCaseReturn {
  access_token: string
  access_token_expires_at: Date
  organization: {
    name: string
    email: string
    role: string
  }
  refresh_token: string
  refresh_token_expires_at: Date
  session_id: string
}
