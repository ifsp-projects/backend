import type { Prisma, Session } from '@prisma-generated'

export interface AuthInterface {
  createSession(payload: Prisma.SessionUncheckedCreateInput): Promise<Session>
  deleteSession(id: string): Promise<Session | null>
  findSessionById(id: string): Promise<Session | null>
  updatePassword(id: string, password: string): Promise<null>
}
