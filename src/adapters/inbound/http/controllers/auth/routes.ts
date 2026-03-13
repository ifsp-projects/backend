import { loginUserController } from './login-user'
import { logoutUserController } from './logout-user'
import { refreshTokenController } from './refresh-token'
import { socialLoginController } from './social-login'
import { ssoRefreshTokenController } from './sso-refresh-token'

export const authRoutes = [
  refreshTokenController, 
  socialLoginController,
  loginUserController,
  logoutUserController,
  ssoRefreshTokenController
]
