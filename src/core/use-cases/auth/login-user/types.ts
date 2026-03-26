export interface LoginUserUseCasePayload {
  email: string
  password: string
}

export interface LoginUserUseCaseReturn {
  session_id: string
  access_token: string
  refresh_token: string
  access_token_expires_at: Date
  refresh_token_expires_at: Date
  organization: {
    name: string
    email: string
    role: string
  }
}