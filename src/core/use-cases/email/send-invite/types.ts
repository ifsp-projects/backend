export interface SendInviteUseCasePayload {
  email: string
  organization_id: string
}

export interface SendInviteUseCaseReturn {
  invite_id: string
  email: string
  expires_at: Date
}
