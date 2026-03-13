import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'
import { SessionNotFoundError } from '@/core/domain/exceptions/auth'

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute({ session_id }: { session_id: string }): Promise<void> {
    const deleted = await this.authRepository.deleteSession(session_id)

    if (!deleted) throw new SessionNotFoundError()
  }
}
