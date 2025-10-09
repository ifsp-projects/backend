export class UnauthorizedError extends Error {
  constructor(public status = 401) {
    super('Unauthorized.')
  }
}
