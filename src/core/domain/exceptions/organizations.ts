import { ControllerError } from '@/adapters/inbound/http/middlewares/general-error-handler'

export class OrganizationAlreadyExistsError extends ControllerError {
  constructor(public status = 409) {
    super('Organization already exists.')
  }
}

export class OrganizationDoesNotExistError extends ControllerError {
  constructor(public status = 404) {
    super('Organization does not exist.')
  }
}
