import { createOrganizationController } from './create-organization'
import { deleteOrganizationController } from './delete-organization'
import { getAllOrganizationsController } from './get-all-organizations'
import { getOrganizationByEmailController } from './get-organization-by-email'
import { getOrganizationByIdController } from './get-organization-by-id'
import { getOrganizationBySlugController } from './get-organization-by-slug'
import { updateOrganizationController } from './update-organization'

export const organizationsRoutes = [
  getAllOrganizationsController,
  getOrganizationByIdController,
  getOrganizationByEmailController,
  updateOrganizationController,
  deleteOrganizationController,
  createOrganizationController,
  getOrganizationBySlugController
]
