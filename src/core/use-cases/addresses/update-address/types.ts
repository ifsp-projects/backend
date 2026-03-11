import { Address, Prisma } from '@prisma-generated'

export interface UpdateAdddressPayload
  extends Omit<Prisma.AddressUncheckedUpdateInput, 'id'> {
  id: string
}

export interface UpdateAdddressUseCaseReturn {
  address: Address
}
