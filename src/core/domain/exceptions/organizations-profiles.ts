import { ControllerError } from '@/adapters/inbound/http/middlewares/general-error-handler'

export class OrganizationProfileAlreadyExistsError extends ControllerError {
  constructor(public status = 409) {
    super('Organization already exists.')
  }
}

export class OrganizationProfileDoesNotExistError extends ControllerError {
  constructor(public status = 404) {
    super('Organization does not exist.')
  }
}
