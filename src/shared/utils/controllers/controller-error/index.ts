import { ZodErrorFormatter } from 'capivara-solidaria-ts-sdk'
import { ZodError } from 'zod'

import type { ControllerErrorPayload, ControllerErrorReturn } from './types'

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
