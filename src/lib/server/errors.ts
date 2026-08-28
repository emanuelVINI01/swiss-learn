import "server-only";

// Domain-level exceptions thrown by lib/server/*.ts use cases. Each one
// carries its own HTTP status so route handlers never have to guess what a
// given failure message means — see toErrorResponse() in http.ts, the single
// place that turns one of these into a Response.
export abstract class DomainError extends Error {
  abstract readonly status: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  readonly status = 404;
}

// The request was well-formed but conflicts with the resource's current
// state (quiz already finished, question already answered, etc.).
export class ConflictError extends DomainError {
  readonly status = 409;
}

export class InvalidRequestError extends DomainError {
  readonly status = 400;
}
