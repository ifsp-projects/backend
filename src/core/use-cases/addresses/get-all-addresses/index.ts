import type { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { AddressDoesNotExistError } from '@/core/domain/exceptions/addresses'

import type { GetAllAddressesUseCaseReturn } from './types'

export class GetAllAddressesUseCase {
  constructor(protected readonly addressesRepository: AddressesRepository) {}

  execute = async (): Promise<GetAllAddressesUseCaseReturn> => {
    const data = await this.addressesRepository.getAllAddresses()

    if (!data) {
      throw new AddressDoesNotExistError()
    }

    return {
      addresses: data
    }
  }
}
