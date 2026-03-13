import { ControllerError } from '@/adapters/inbound/http/middlewares/general-error-handler'

export class InviteTokenAlreadyExpiredError extends ControllerError {
  constructor(public status = 410) {
    super('This invite link has expired.')
  }
}

export class InviteTokenAlreadyCancelledError extends ControllerError {
  constructor(public status = 410) {
    super('This invite has been cancelled.')
  }
}

export class InviteTokenAlreadyUsedError extends ControllerError {
  constructor(public status = 410) {
    super('This invite has already been used.')
  }
}

export class InviteTokenDoesNotExistError extends ControllerError {
  constructor(public status = 404) {
    super('Invite not found.')
  }
}
