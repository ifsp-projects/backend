import type { Address, Prisma } from '@prisma-generated'

export interface AddressInterface {
  createAddress: (
    payload: Prisma.AddressUncheckedCreateInput
  ) => Promise<Address>
  deleteAddress: (id: string) => Promise<Address | null>
  getAddressById: (id: string) => Promise<Address | null>
  getAllAddresses: () => Promise<Address[]>
  updateAddress: (
    id: string,
    payload: Prisma.OrganizationUncheckedUpdateInput
  ) => Promise<Address | null>
}
