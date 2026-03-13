import { cancelPendingInviteController } from './cancel-pending-invite'
import { createAndSendInviteController } from './create-and-send-invite'
import { listAllInvitesController } from './list-all-invites'
import { regenerateAndResendInviteController } from './regenerate-token-and-resend-email'

export const AdminRoutes = [
  createAndSendInviteController,
  regenerateAndResendInviteController,
  listAllInvitesController,
  cancelPendingInviteController
]
