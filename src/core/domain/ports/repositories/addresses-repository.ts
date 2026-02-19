import { Address, Prisma } from '@prisma/client'

export interface AddressInterface {
  createAddress: (
    payload: Prisma.OrganizationUncheckedCreateInput
  ) => Promise<Address>
  getAllAddresses: () => Promise<Address[]>
  getAddressById: (id: string) => Promise<Address | null>
  updateAddress: (
    id: string,
    payload: Prisma.OrganizationUncheckedUpdateInput
  ) => Promise<Address | null>
  deleteAddress: (id: string) => Promise<Address | null>
}
