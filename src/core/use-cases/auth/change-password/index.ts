import { AuthRepository } from "@/adapters/outbound/prisma/repositories/auth-repository"
import { Duration, JwtService } from "@/shared/infra/auth/jwt"
import { ResendRepository } from "@/shared/infra/email/resend"
import { LoginUserUseCaseReturn } from "../login-user/types"
import { AdminRepository } from "@/adapters/outbound/prisma/repositories/admin-repositories"
import { InviteTokenAlreadyCancelledError, InviteTokenAlreadyExpiredError, InviteTokenAlreadyUsedError, InviteTokenDoesNotExistError } from "@/core/domain/exceptions/admin"
import { OrganizationsRepository } from "@/adapters/outbound/prisma/repositories/organization-repository"
import { OrganizationDoesNotExistError } from "@/core/domain/exceptions/organizations"
import { hashPassword } from "@/shared/infra/auth/password"

interface Input {
  invite_token: string
  new_password: string
}

export class ResetPasswordAndLoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute({ invite_token, new_password }: Input): Promise<LoginUserUseCaseReturn> {
    const invite = await this.adminRepository.getInviteByToken(invite_token)

    if (!invite) throw new InviteTokenDoesNotExistError()

    if (invite.used_at) throw new InviteTokenAlreadyUsedError()

    if (invite.cancelled_at) throw new InviteTokenAlreadyCancelledError()

    if (invite.expires_at < new Date())
      throw new InviteTokenAlreadyExpiredError()

    const organization = await this.organizationsRepository.getOrganizationByEmail(invite.email)

    if (!organization) throw new OrganizationDoesNotExistError()

    const newHash = await hashPassword(new_password)

    await this.authRepository.updatePassword(organization.id, newHash)

    const { token: access_token, claims: access_claims } =
      this.jwtService.createToken(organization.id, organization.email, Duration.minutes(15))

    const { token: refresh_token, claims: refresh_claims } =
      this.jwtService.createToken(organization.id, organization.email, Duration.days(7))

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
        name: organization.organization_profile?.name || '',
        email: organization.email
      }
    }
  }
}
