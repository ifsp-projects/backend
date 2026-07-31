import { createOrganizationProfileController } from './create-organization-profile'
import { deleteOrganizationprofileController } from './delete-organization-profile'
import { updateOrganizationProfileController } from './update-organization-profile'

export const organizationsProfilesRoutes = [
  updateOrganizationProfileController,
  deleteOrganizationprofileController,
  createOrganizationProfileController
]
