import { AddressesRepository } from '@/adapters/outbound/prisma/repositories/addresses-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { UpdateAddressUseCase } from '@/core/use-cases/addresses/update-address'
import { updateAddressBodySchema, updateAddressParamsSchema } from './schemas'

export class UpdateAddressController {
  private addressRepository: AddressesRepository
  private useCase: UpdateAddressUseCase

  constructor() {
    this.addressRepository = new AddressesRepository()
    this.useCase = new UpdateAddressUseCase(this.addressRepository)
  }

  @Route('PATCH', '/addresses/:id', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = updateAddressParamsSchema.parse(request.params)

    const payload = updateAddressBodySchema.parse(request.body)

    const response = await this.useCase.execute({ ...payload, id })

    return reply.status(200).send(response)
  }
}

export const updateAddressController = new UpdateAddressController()
