import { createdAddressController } from './create-address'
import { deleteAddressController } from './delete-address'
import { getAddressByIdController } from './get-address-by-id'
import { getAllAddressesController } from './get-all-addresses'
import { updateAddressController } from './update-address'

export const addressesRoutes = [
  getAllAddressesController,
  getAddressByIdController,
  createdAddressController,
  updateAddressController,
  deleteAddressController
]
