import { createAndSendInviteController } from './create-and-send-invite'
import { getInviteByTokenController } from './get-invite-by-token'
import { listAllInvitesController } from './list-all-invites'
import { useInviteTokenController } from './use-invite-token'
import { validateInviteTokenController } from './validate-invite-token'

export const adminRoutes = [
  createAndSendInviteController,
  listAllInvitesController,
  useInviteTokenController,
  validateInviteTokenController,
  getInviteByTokenController
]
