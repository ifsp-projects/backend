import { randomUUID } from 'crypto'

import { prisma } from '@/adapters/outbound/prisma/prisma'
import type {
  AdminInterface,
  TokenValidationResponse
} from '@/core/domain/ports/interfaces/admin-interface'
import type { CreateInviteTokenUseCasePayload } from '@/core/use-cases/admin/create-and-send-invite/types'

export class AdminRepository implements AdminInterface {
  listAllInvites = async () => {
    return await prisma.inviteToken.findMany()
  }

  createAndSendInvite = async (payload: CreateInviteTokenUseCasePayload) => {
    return await prisma.inviteToken.create({
      data: {
        id: randomUUID(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 72),
        email: payload.email,
        organization_id: payload.organization_id
      }
    })
  }

  getInviteTokenById = async (id: string) => {
    return await prisma.inviteToken.findFirst({
      where: {
        id
      }
    })
  }

  useInviteToken = async (token: string) => {
    const existingInvite = await prisma.inviteToken.findFirst({
      where: {
        id: token
      }
    })

    if (!existingInvite) {
      return null
    }

    if (existingInvite.used_at) {
      return null
    }

    await prisma.inviteToken.update({
      where: {
        id: token
      },
      data: {
        used_at: new Date(Date.now())
      }
    })

    await prisma.organization.update({
      where: {
        id: existingInvite.email
      },
      data: {
        account_status: 'active'
      }
    })

    return null
  }

  getInviteByToken = async (token: string) => {
    return await prisma.inviteToken.findFirst({
      where: {
        token
      }
    })
  }

  validateToken = async (token: string): Promise<TokenValidationResponse> => {
    const invite = await prisma.inviteToken.findUnique({
      where: { token }
    })

    if (!invite)
      return {
        valid: false,
        reason: 'not_found'
      }

    if (invite.used_at)
      return {
        valid: false,
        reason: 'used'
      }

    if (invite.cancelled_at)
      return {
        valid: false,
        reason: 'cancelled'
      }

    if (invite.expires_at < new Date())
      return {
        valid: false,
        reason: 'expired'
      }

    return {
      valid: true,
      email: invite.email,
      organizationId: invite.organization_id
    }
  }
}
