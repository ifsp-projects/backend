import { Address, Prisma } from '@prisma/client'

export interface UpdateAdddressPayload
  extends Omit<Prisma.AddressUncheckedUpdateInput, 'id'> {
  id: string
}

export interface UpdateAdddressUseCaseReturn {
  address: Address
}
