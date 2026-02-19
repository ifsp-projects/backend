import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { GetAddressByIdUseCaseReturn } from '../get-address-by-id/types'
import { AddressDoesNotExistError } from '@/core/domain/exceptions/addresses'

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
