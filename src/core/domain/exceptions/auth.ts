import { ControllerError } from '@/adapters/inbound/http/middlewares/general-error-handler'

export class InvalidAuthCodeError extends ControllerError {
  constructor(public status = 400) {
    super('Invalid auth code.')
  }
}

export class InvalidSocialAccountError extends ControllerError {
  constructor(public status = 400) {
    super('Invalid social account.')
  }
}
