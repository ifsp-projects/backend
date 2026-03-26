import { InvalidSessionError, InvalidTokenError, SessionNotFoundError, SessionRevokedError } from '@/core/domain/exceptions/auth'
import {
  SSORefreshTokenUseCasePayload,
  SSORefreshTokenUseCaseReturn
} from './types'
import { Duration, JwtService } from '@/shared/infra/auth/jwt'
import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'

export class RefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService
  ) { }

  async execute({
    refresh_token
  }: SSORefreshTokenUseCasePayload): Promise<SSORefreshTokenUseCaseReturn> {
    let refresh_claims

    try {
      refresh_claims = this.jwtService.verifyToken(refresh_token)
    } catch {
      throw new InvalidTokenError()
    }

    const session = await this.authRepository.findSessionById(refresh_claims.jti)
    if (!session) throw new SessionNotFoundError()

    if (session.is_revoked) throw new SessionRevokedError()

    if (session.email !== refresh_claims.email)
      throw new InvalidSessionError()

    const { token: access_token, claims: access_claims } =
      this.jwtService.createToken(
        refresh_claims.id,
        refresh_claims.email,
        refresh_claims.role,
        Duration.minutes(15)
      )

    return {
      access_token,
      access_token_expires_at: new Date(access_claims.exp * 1000)
    }
  }
}
