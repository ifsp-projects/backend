import { ZodErrorFormatter } from 'capivara-solidaria-ts-sdk'
import type { FastifyReply } from 'fastify'
import { ZodError } from 'zod'

import type {
  ControllerErrorMapping,
  ControllerErrorPayload,
  ControllerErrorReturn,
  ResolvedControllerError
} from './types'

export const controllerError = (
  err: ControllerErrorPayload
): ControllerErrorReturn => {
  const { status = 400 } = err

  if (err instanceof ZodError) {
    const errors = ZodErrorFormatter(err)

    return {
      errors,
      status
    }
  }

  return {
    errors: [
      {
        message: err.message
      }
    ],
    status
  }
}

export const resolveControllerError = (
  error: unknown,
  reply: FastifyReply,
  mappings: ControllerErrorMapping[],
  fallback: { status: number; message: string } = {
    status: 500,
    message: 'Internal server error'
  }
): ResolvedControllerError => {
  for (const mapping of mappings) {
    if (error instanceof mapping.error) {
      return {
        status: mapping.status,
        message: mapping.message ?? error.message,
        reply: mapping.onMatch ? mapping.onMatch(error, reply) : reply
      }
    }
  }
  return { ...fallback, reply }
}
