import { CreateInviteTokenUseCasePayload } from '@/core/use-cases/admin/create-and-send-invite/types'
import { InviteToken } from '@prisma-generated'

export type TokenValidationResponse = {
  valid: boolean
  reason?: string
  email?: string
  organizationId?: string
}

export interface AdminInterface {
  createAndSendInvite: (
    payload: CreateInviteTokenUseCasePayload
  ) => Promise<InviteToken | null>
  cancelPendingInvite: (id: string) => Promise<null>
  listAllInvites: () => Promise<InviteToken[]>
  regenerateAndResendToken: (id: string) => Promise<InviteToken | null>
  getInviteTokenById: (id: string) => Promise<InviteToken | null>
  getInviteByToken: (token: string) => Promise<InviteToken | null>
  validateToken: (token: string) => Promise<TokenValidationResponse>
  useInviteToken: (token: string) => Promise<null> 
}
