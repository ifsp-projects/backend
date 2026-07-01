import type { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { AddressDoesNotExistError } from '@/core/domain/exceptions/addresses'

import type {
  UpdateAdddressPayload,
  UpdateAdddressUseCaseReturn
} from './types'

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
