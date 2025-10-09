import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { createOrganizationSchema } from './schema'
import { controllerError } from '@/utils/controllers/controller-error'
import { UnauthorizedError } from '@/errors/authorization/unauthorized-error'
import { prisma } from '@/lib/database/prisma'

export const createOrganization = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { email, name, slug } = createOrganizationSchema.parse(request.body)

    const token = request.headers.authorization
    if (!token) throw new UnauthorizedError()

    const createdOrganization = await prisma.organization.create({
      data: {
        email,
        name,
        slug
      }
    }) 

    return reply.status(201).send(createdOrganization)
    
  } catch (createOrganizationErr) {
    const error = controllerError(createOrganizationErr as Error)

    reply.status(error.status).send(error)
  }
}
