import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetAllAddressesUseCase } from '@/core/use-cases/addresses/get-all-addresses'

export class GetAllAddressesController {
  private addressRepository: AddressesRepository
  private useCase: GetAllAddressesUseCase

  constructor() {
    this.addressRepository = new AddressesRepository()
    this.useCase = new GetAllAddressesUseCase(this.addressRepository)
  }

  @Route('GET', '/addresses', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const response = await this.useCase.execute()

    return reply.status(200).send(response)
  }
}

export const getAllAddressesController = new GetAllAddressesController()
