import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { GetAllAddressesUseCaseReturn } from './types'
import { AddressDoesNotExistError } from '@/core/domain/exceptions/addresses'

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
