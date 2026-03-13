import { CreateInviteTokenUseCasePayload } from '@/core/use-cases/admin/create-and-send-invite/types'
import { Prisma, InviteToken } from '@prisma-generated'

export interface AdminInterface {
  createAndSendInvite: (
    payload: CreateInviteTokenUseCasePayload
  ) => Promise<InviteToken | null>
  cancelPendingInvite: (id: string) => Promise<null>
  listAllInvites: () => Promise<InviteToken[]>
  regenerateAndResendToken: (id: string) => Promise<InviteToken | null>
  getInviteTokenById: (id: string) => Promise<InviteToken | null>
}
