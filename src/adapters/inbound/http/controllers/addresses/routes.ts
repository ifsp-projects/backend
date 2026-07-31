import { createAddressController } from './create-address'
import { deleteAddressController } from './delete-address'
import { getAddressByIdController } from './get-address-by-id'
import { updateAddressController } from './update-address'

export const addressesRoutes = [
  getAddressByIdController,
  createAddressController,
  updateAddressController,
  deleteAddressController
]
