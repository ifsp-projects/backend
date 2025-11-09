import { getAllOrganizationsController } from './get-all-organizations'
import { getOrganizationByIdController } from './get-organization-by-id'
import { getOrganizationByEmailController } from './get-organization-by-email'
import { deleteOrganizationController } from './delete-organization'
import { updateOrganizationController } from './update-organization'
import { createOrganizationController } from './create-organization'

export const organizationsRoutes = [
  getAllOrganizationsController,
  getOrganizationByIdController,
  getOrganizationByEmailController,
  updateOrganizationController,
  deleteOrganizationController,
  createOrganizationController
]
