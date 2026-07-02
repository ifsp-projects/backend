export interface SendInviteEmailPayload {
  expires_at: Date
  organization_id: string
  to: string
  token: string
}

export interface SendInviteEmailResult {
  message_id: string
}

export interface EmailInterface {
  sendInviteEmail(
    payload: SendInviteEmailPayload
  ): Promise<SendInviteEmailResult>
}
