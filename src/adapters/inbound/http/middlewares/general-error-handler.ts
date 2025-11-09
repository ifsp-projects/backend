import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export class ControllerError extends Error {
  status?: number
}

interface ControllerErrorUnit {
  message: string
  path?: string
}

export interface ControllerErrorReply {
  errors: ControllerErrorUnit[]
  status: number
}

export class GeneralErrorHandler {
  static handle(err: unknown, request: FastifyRequest, reply: FastifyReply) {
    this.registerLog(err, request)

    if (err instanceof ControllerError) {
      const status = err.status || 500

      reply.status(status).send({
        errors: [
          {
            message: err.message
          }
        ],
        status
      })
      return
    }

    if (err instanceof ZodError) {
      const status = 400
      const errors = this.formatZodError(err)

      reply.status(status).send({
        errors,
        status
      })
      return
    }

    reply.status(500).send('Internal Server Error')
  }

  private static registerLog(err: unknown, request: FastifyRequest) {
    let metadata = {}

    if (request.body) {
      metadata = {
        ...metadata,
        body: request.body
      }
    }

    if (request.query) {
      metadata = {
        ...metadata,
        query: request.query
      }
    }
  }

  private static formatZodError(err: ZodError) {
    const formatted = err.issues.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }))

    return formatted
  }
}
