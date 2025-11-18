import { Address } from '@prisma/client'

export interface GetAllAddressesUseCaseReturn {
  addresses: Address[]
}
