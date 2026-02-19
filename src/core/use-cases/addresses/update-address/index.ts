import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { UpdateAdddressPayload, UpdateAdddressUseCaseReturn } from './types'
import { AddressDoesNotExistError } from '@/core/domain/exceptions/addresses'

export class UpdateAddressUseCase {
  constructor(protected readonly addressesRepository: AddressesRepository) {}

  execute = async (
    payload: UpdateAdddressPayload
  ): Promise<UpdateAdddressUseCaseReturn> => {
    const { id } = payload

    const addressExists = await this.addressesRepository.getAddressById(id)

    if (!addressExists) {
      throw new AddressDoesNotExistError()
    }

    const updatedAddress = await this.addressesRepository.updateAddress(
      id,
      payload
    )

    return {
      address: updatedAddress
    }
  }
}
