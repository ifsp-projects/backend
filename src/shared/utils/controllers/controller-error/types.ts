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
