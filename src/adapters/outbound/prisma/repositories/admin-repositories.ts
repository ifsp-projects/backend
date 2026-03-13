import { InviteToken, Prisma } from '@prisma-generated'

import { randomUUID } from 'crypto'
import { prisma } from '@/adapters/outbound/prisma/prisma'
import { AdminInterface } from '@/core/domain/ports/repositories/admin-repository'
import { CreateInviteTokenUseCasePayload } from '@/core/use-cases/admin/create-and-send-invite/types'

export class AdminRepository implements AdminInterface {
  listAllInvites = async () => {
    return await prisma.inviteToken.findMany()
  }

  cancelPendingInvite = async (id: string) => {
    await prisma.inviteToken.update({
      where: { id },
      data: {
        cancelled_at: new Date()
      }
    })

    return null
  }

  regenerateAndResendToken = async (id: string) => {
    const existingInvite = await prisma.inviteToken.findUnique({
      where: {
        id
      }
    })

    if (!existingInvite) {
      throw new Error('Invite not found')
    }

    if (existingInvite.used_at) {
      throw new Error('Invite already used')
    }

    // Invalidated old token
    await prisma.inviteToken.update({
      where: { id },
      data: { cancelled_at: new Date() }
    })

    const refreshedInvite = await prisma.inviteToken.create({
      data: {
        email: existingInvite.email,
        organization_id: existingInvite.organization_id,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 72) // 72h from now
      }
    })

    // await sendInviteEmail({
    //   to: newInvite.email,
    //   token: newInvite.token
    // })

    return refreshedInvite
  }

  createAndSendInvite = async (
    payload: CreateInviteTokenUseCasePayload
  ) => {
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
}
