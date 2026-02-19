import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { CreateAddressUseCase } from '@/core/use-cases/addresses/create-address'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAddressBodySchema } from './schemas'

export class CreateAddressController {
  private addressRepository: AddressesRepository
  private useCase: CreateAddressUseCase

  constructor() {
    this.addressRepository = new AddressesRepository()
    this.useCase = new CreateAddressUseCase(this.addressRepository)
  }

  @Route('POST', '/addresses', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = createAddressBodySchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(201).send(response)
  }
}

export const createdAddressController = new CreateAddressController()
