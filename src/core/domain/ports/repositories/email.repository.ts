export interface SendInviteEmailPayload {
  to: string
  token: string
  organization_id: string
  expires_at: Date
}

export interface SendInviteEmailResult {
  message_id: string
}

export interface EmailInterface {
  sendInviteEmail(
    payload: SendInviteEmailPayload
  ): Promise<SendInviteEmailResult>
}
