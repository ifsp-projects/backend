import type { FastifyReply } from 'fastify'

export interface ControllerErrorPayload extends Error {
  status?: number
}

interface ControllerError {
  message: string
  path?: string
}

export interface ControllerErrorReturn {
  errors: ControllerError[]
  status: number
}

export interface ControllerErrorMapping<E extends Error = Error> {
  error: new (...args: never[]) => E
  message?: string
  onMatch?: (error: E, reply: FastifyReply) => FastifyReply
  status: number
}

export interface ResolvedControllerError {
  message: string
  reply: FastifyReply
  status: number
}
