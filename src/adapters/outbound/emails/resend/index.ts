import { Resend } from 'resend'

import { env } from '@/config/env'
import type {
  EmailInterface,
  SendInviteEmailPayload,
  SendInviteEmailResult
} from '@/core/domain/ports/interfaces/email.interface'
import { observeDependency } from '@/shared/infra/open-telemetry/dependency-metrics'

import { renderInviteEmail } from './templates/invite-email-template'

export class ResendRepository implements EmailInterface {
  private readonly client: Resend
  private readonly fromAddress: string
  private readonly appUrl: string

  constructor() {
    const apiKey = env.RESEND_API_KEY
    const fromAddress = env.EMAIL_FROM
    const appUrl = env.APP_URL

    if (!apiKey || !fromAddress || !appUrl) {
      throw new Error(
        'Missing email environment variables: RESEND_API_KEY, EMAIL_FROM, APP_URL'
      )
    }

    this.client = new Resend(apiKey)
    this.fromAddress = fromAddress
    this.appUrl = appUrl
  }

  async sendInviteEmail(
    payload: SendInviteEmailPayload
  ): Promise<SendInviteEmailResult> {
    const inviteUrl = `${this.appUrl}/onboarding/reset-password?token=${payload.token}`

    const data = await observeDependency('resend', 'send_invite', () =>
      this.client.emails
        .send({
          from: `Capivara Solidária <${this.fromAddress}>`,
          to: payload.to,
          subject: 'You have been invited to join the platform',
          html: renderInviteEmail({
            inviteUrl,
            email: payload.to,
            expiresAt: payload.expires_at
          })
        })
        .then(result => {
          if (result.error || !result.data) {
            throw new Error('Failed to send invite email')
          }
          return result.data
        })
    )

    return { message_id: data.id }
  }
}
