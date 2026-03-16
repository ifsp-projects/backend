import { cancelPendingInviteController } from './cancel-pending-invite'
import { createAndSendInviteController } from './create-and-send-invite'
import { getInviteByTokenController } from './get-invite-by-token'
import { listAllInvitesController } from './list-all-invites'
import { regenerateAndResendInviteController } from './regenerate-token-and-resend-email'
import { useInviteTokenController } from './use-invite-token'
import { validateInviteTokenController } from './validate-invite-token'

export const adminRoutes = [
  createAndSendInviteController,
  regenerateAndResendInviteController,
  listAllInvitesController,
  cancelPendingInviteController,
  useInviteTokenController,
  validateInviteTokenController,
  getInviteByTokenController
]
