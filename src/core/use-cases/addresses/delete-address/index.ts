import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'

import { AddressDoesNotExistError } from '@/core/domain/exceptions/addresses'
import { DeleteAddressUseCaseReturn } from './types'

export class DeleteAddressUseCase {
  constructor(protected readonly addressesRepository: AddressesRepository) {}

  execute = async (id: string): Promise<DeleteAddressUseCaseReturn> => {
    const addressExists = await this.addressesRepository.getAddressById(id)

    if (!addressExists) {
      throw new AddressDoesNotExistError()
    }

    const deletedAddress = await this.addressesRepository.deleteAddress(id)

    if (!deletedAddress) {
      throw new AddressDoesNotExistError()
    }

    return {
      address: deletedAddress
    }
  }
}
