import { ControllerError } from '@/adapters/inbound/http/middlewares/general-error-handler'

export class AddressAlreadyExistsError extends ControllerError {
  constructor(public status = 409) {
    super('Address already exists.')
  }
}

export class AddressDoesNotExistError extends ControllerError {
  constructor(public status = 404) {
    super('Address does not exist.')
  }
}
