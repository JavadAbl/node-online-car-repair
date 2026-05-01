import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message?: string, statusCode: number = 500, stack?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, field: string, value: unknown, stack?: string) {
    super(`${entity} ${field} with value ${value} not found`, StatusCodes.NOT_FOUND, stack);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(entity: string, field: string, value: unknown, stack?: string) {
    super(`${entity} conflict: ${field} with value ${value} already exists`, StatusCodes.CONFLICT, stack);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", stack?: string) {
    super(message, StatusCodes.BAD_REQUEST, stack);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", stack?: string) {
    super(message, StatusCodes.UNAUTHORIZED, stack);
    this.name = "UnauthorizedError";
  }
}
