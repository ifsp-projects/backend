import type { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import type { Prisma } from '@prisma-generated'

import type { CreateAddressUseCaseReturn } from './types'

export class CreateAddressUseCase {
  constructor(protected readonly addressesRepository: AddressesRepository) {}

  execute = async (
    payload: Prisma.AddressUncheckedCreateInput
  ): Promise<CreateAddressUseCaseReturn> => {
    const createdAddress = await this.addressesRepository.createAddress({
      ...payload
    })

    return {
      address: createdAddress
    }
  }
}
