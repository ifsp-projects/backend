import type { CreateInviteTokenUseCasePayload } from '@/core/use-cases/admin/create-and-send-invite/types'
import type { InviteToken } from '@prisma-generated'

export type TokenValidationResponse = {
  valid: boolean
  reason?: string
  email?: string
  organizationId?: string
}

export interface AdminInterface {
  cancelPendingInvite: (id: string) => Promise<null>
  createAndSendInvite: (
    payload: CreateInviteTokenUseCasePayload
  ) => Promise<InviteToken | null>
  getInviteByToken: (token: string) => Promise<InviteToken | null>
  getInviteTokenById: (id: string) => Promise<InviteToken | null>
  listAllInvites: () => Promise<InviteToken[]>
  regenerateAndResendToken: (id: string) => Promise<InviteToken | null>
  useInviteToken: (token: string) => Promise<null>
  validateToken: (token: string) => Promise<TokenValidationResponse>
}
