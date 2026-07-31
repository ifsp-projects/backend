import type { Address, Prisma } from '@prisma-generated'

export interface AddressInterface {
  createAddress: (
    payload: Prisma.AddressUncheckedCreateInput
  ) => Promise<Address>
  deleteAddress: (id: string) => Promise<Address | null>
  getAddressById: (id: string) => Promise<Address | null>
  updateAddress: (
    id: string,
    payload: Prisma.AddressUncheckedUpdateInput
  ) => Promise<Address | null>
}
