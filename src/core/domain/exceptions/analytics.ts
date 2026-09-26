export class VisitorsQueryError extends Error {
  constructor(options?: ErrorOptions) {
    super('Visitors data is temporarily unavailable', options)
  }
}
