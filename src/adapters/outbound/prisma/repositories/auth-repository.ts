import type { AuthInterface } from '@/core/domain/ports/interfaces/auth-interface'
import type { Prisma } from '@prisma-generated'

import { prisma } from '../prisma'

export class AuthRepository implements AuthInterface {
  createSession = async (payload: Prisma.SessionUncheckedCreateInput) => {
    return prisma.session.create({
      data: {
        id: payload.id,
        email: payload.email,
        refresh_token: payload.refresh_token,
        is_revoked: false,
        expires_at: payload.expires_at
      }
    })
  }

  findSessionById = async (id: string) => {
    return prisma.session.findUnique({
      where: {
        id
      }
    })
  }

  deleteSession = async (id: string) => {
    return prisma.session
      .delete({
        where: {
          id
        }
      })
      .catch(() => null)
  }

  updatePassword = async (id: string, password: string) => {
    await prisma.organization.update({
      where: {
        id
      },
      data: {
        password
      }
    })

    return null
  }
}
