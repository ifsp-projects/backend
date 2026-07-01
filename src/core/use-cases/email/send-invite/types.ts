export interface SendInviteUseCasePayload {
  invite_token: string
}

export interface SendInviteUseCaseReturn {
  email: string
  expires_at: Date
  invite_id: string
}
