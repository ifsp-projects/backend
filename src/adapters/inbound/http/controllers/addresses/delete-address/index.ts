import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { DeleteAddressUseCase } from '@/core/use-cases/addresses/delete-address'

import { Trace } from '../../../decorators/trace-decorator'
import { deleteAddressParamsSchema } from './schema'

export class DeleteAddressController {
  private addressRepository: AddressesRepository
  private useCase: DeleteAddressUseCase

  constructor() {
    this.addressRepository = new AddressesRepository()
    this.useCase = new DeleteAddressUseCase(this.addressRepository)
  }

  @Route('DELETE', '/addresses/:id', {
    middlewares: [verifyJWT]
  })
  @Trace('addresses.delete_address')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = deleteAddressParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(204).send(response)
  }
}

export const deleteAddressController = new DeleteAddressController()
