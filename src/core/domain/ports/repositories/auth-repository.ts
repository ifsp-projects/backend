import { Prisma, Session } from '@prisma-generated'

export interface AuthInterface {
  createSession(payload: Prisma.SessionUncheckedCreateInput): Promise<Session>
  findSessionById(id: string): Promise<Session | null>
  deleteSession(id: string): Promise<Session | null>
  updatePassword(id: string, password: string): Promise<null>
}
