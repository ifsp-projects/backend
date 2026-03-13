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

export class WrongPasswordError extends ControllerError {
  constructor(public status = 401) {
    super('Invalid credentials.')
  }
}

export class SessionNotFoundError extends ControllerError {
  constructor(public status = 404) {
    super('Session not found.')
  }
}

export class SessionRevokedError extends ControllerError {
  constructor(public status = 401) {
    super('Session already revoked.')
  }
}

export class InvalidSessionError extends ControllerError {
  constructor(public status = 401) {
    super('Invalid session.')
  }
}

export class InvalidTokenError extends ControllerError {
  constructor(public status = 401) {
    super('Invalid or expired token.')
  }
}
