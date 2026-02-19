import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetAdddressByIdUseCase } from '@/core/use-cases/addresses/get-address-by-id'
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
