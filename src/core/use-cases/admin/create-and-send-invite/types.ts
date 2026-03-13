import { InviteToken } from '@prisma-generated'

export interface CreateInviteTokenUseCaseReturn {
  inviteToken: InviteToken
}

export interface CreateInviteTokenUseCasePayload {
  email: string
  organization_id: string
}
