import { AddressesRepository } from '@/core/ports/repositories/prisma/addresses-repository'
import { Prisma } from '@prisma/client'
import { CreateAddressUseCaseReturn } from './types'

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
