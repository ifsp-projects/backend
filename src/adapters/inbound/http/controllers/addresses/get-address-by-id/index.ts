import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { GetAdddressByIdUseCase } from '@/core/use-cases/addresses/get-address-by-id'

import { Trace } from '../../../decorators/trace-decorator'
import { getAddressByIdParamsSchema } from './schemas'

export class GetAddressByIdController {
  private addressRepository: AddressesRepository
  private useCase: GetAdddressByIdUseCase

  constructor() {
    this.addressRepository = new AddressesRepository()
    this.useCase = new GetAdddressByIdUseCase(this.addressRepository)
  }

  @Route('GET', '/addresses/:id', {
    middlewares: [verifyJWT]
  })
  @Trace('addresses.get_address_by_id')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = getAddressByIdParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const getAddressByIdController = new GetAddressByIdController()
