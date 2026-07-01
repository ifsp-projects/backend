import type { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { AddressDoesNotExistError } from '@/core/domain/exceptions/addresses'

import type { GetAddressByIdUseCaseReturn } from '../get-address-by-id/types'

export class GetAdddressByIdUseCase {
  constructor(protected readonly addressesRepository: AddressesRepository) {}

  execute = async (id: string): Promise<GetAddressByIdUseCaseReturn> => {
    const address = await this.addressesRepository.getAddressById(id)

    if (!address) {
      throw new AddressDoesNotExistError()
    }

    return {
      address
    }
  }
}
