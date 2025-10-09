import { ZodError } from 'zod'

export const ZodErrorFormatter = (err: ZodError) => {
  // @ts-expect-error
  const formatted = err.errors.map(e => ({
    path: e.path.join('.'),
    message: e.message
  }))

  return formatted
}
