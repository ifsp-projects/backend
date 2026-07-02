import { ControllerError } from '@/adapters/inbound/http/middlewares/general-error-handler'

export class CampaignAlreadyExistsError extends ControllerError {
  constructor(public status = 409) {
    super('Campaign already exists.')
  }
}

export class CampaignDoesNotExistError extends ControllerError {
  constructor(public status = 404) {
    super('Campaign does not exist.')
  }
}

export class DoesNotExistsAnyCampaignsError extends ControllerError {
  constructor(public status = 404) {
    super('Any campaign found.')
  }
}
