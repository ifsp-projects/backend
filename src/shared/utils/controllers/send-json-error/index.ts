import type { FastifyReply } from 'fastify'

export const sendJsonError = (
  reply: FastifyReply,
  status: number,
  message: string
): FastifyReply => reply.status(status).send({ error: message })
