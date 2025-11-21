import { ControllerError } from '@/adapters/inbound/http/middlewares/general-error-handler'

export class PageAlreadyExistsError extends ControllerError {
  constructor(public status = 409) {
    super('Page already exists.')
  }
}

export class PageDoesNotExistError extends ControllerError {
  constructor(public status = 404) {
    super('Page does not exist.')
  }
}
