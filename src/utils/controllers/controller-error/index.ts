import { ZodError } from 'zod'

import { ZodErrorFormatter } from '@/utils/formatters/zod-error-formatter'

import { ControllerErrorPayload, ControllerErrorReturn } from './types'

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
