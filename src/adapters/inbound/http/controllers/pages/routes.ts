import { getPageByIdController } from './get-page-by-id'
import { getPageBySlugController } from './get-page-by-slug'
import { updatePageController } from './update-page'

export const pagesRoutes = [
  getPageByIdController,
  getPageBySlugController,
  updatePageController
]
