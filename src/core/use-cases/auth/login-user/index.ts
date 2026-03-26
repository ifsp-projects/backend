import { WrongPasswordError } from '@/core/domain/exceptions/auth'
import { LoginUserUseCasePayload, LoginUserUseCaseReturn } from './types'
import { Duration, JwtService } from '@/shared/infra/auth/jwt'
import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'
import { checkPassword } from '@/shared/infra/auth/password'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly jwtService: JwtService
  ) { }

  async execute({
    email,
    password
  }: LoginUserUseCasePayload): Promise<LoginUserUseCaseReturn> {
    const organization =
      await this.organizationsRepository.getOrganizationByEmail(email)
    if (!organization) throw new OrganizationDoesNotExistError()

    const passwordMatch = await checkPassword(password, organization.password)
    if (!passwordMatch) throw new WrongPasswordError()

    const { token: access_token, claims: access_claims } =
      this.jwtService.createToken(
        organization.id,
        organization.email,
        organization.role,
        Duration.minutes(15)
      )

    const { token: refresh_token, claims: refresh_claims } =
      this.jwtService.createToken(
        organization.id,
        organization.email,
        organization.role,
        Duration.days(7)
      )

    const session = await this.authRepository.createSession({
      id: refresh_claims.jti,
      email: organization.email,
      refresh_token,
      expires_at: new Date(refresh_claims.exp * 1000)
    })

    return {
      session_id: session.id,
      access_token,
      refresh_token,
      access_token_expires_at: new Date(access_claims.exp * 1000),
      refresh_token_expires_at: new Date(refresh_claims.exp * 1000),
      organization: {
        name: organization?.organization_profile?.name || '',
        email: organization.email,
        role: organization?.role
      }
    }
  }
}
