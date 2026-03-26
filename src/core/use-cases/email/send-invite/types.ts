export interface SendInviteUseCasePayload {
  invite_token: string
}

export interface SendInviteUseCaseReturn {
  invite_id: string
  email: string
  expires_at: Date
}
