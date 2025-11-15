import { createOrganizationProfileController } from "./create-organization";
import { deleteOrganizationprofileController } from "./delete-organization";
import { getAllOrganizationsProfilesController } from "./get-all-organizations";
import { getOrganizationProfileByEmailController } from "./get-organization-by-email";
import { getOrganizationProfileByIdController } from "./get-organization-by-id";
import { updateOrganizationProfileController } from "./update-organization";

export const organizationsProfilesRoutes = [
  getAllOrganizationsProfilesController,
  getOrganizationProfileByIdController,
  getOrganizationProfileByEmailController,
  updateOrganizationProfileController,
  deleteOrganizationprofileController,
  createOrganizationProfileController
]
