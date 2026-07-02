import { createCampaignController } from './create-campaign'
import { deleteCampaignController } from './delete-campaign'
import { getAllCampaignsController } from './get-all-campaigns'
import { getCampaignByIdController } from './get-campaign-by-id'
import { updateCampaignController } from './update-campaign'

export const campaignRoutes = [
  createCampaignController,
  deleteCampaignController,
  getCampaignByIdController,
  getAllCampaignsController,
  updateCampaignController
]
