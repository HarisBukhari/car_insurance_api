import { StatusCodes } from "http-status-codes"

export class CustomError extends Error {
    constructor(message: string, source: string) {
        super(`[${source}] ${message}`)
        this.name = `[${source}] ${message}`
        Object.setPrototypeOf(this, new.target.prototype)
        Error.captureStackTrace(this)
    }
}

export class BadRequestError extends CustomError {
    statusCode: StatusCodes;
    constructor(message: string, source: string) {
        super(message, source)
        this.statusCode = StatusCodes.BAD_REQUEST;
    }
}

export class NotFoundError extends CustomError {
    statusCode: StatusCodes;
    constructor(message: string, source: string) {
        super(message, source)
        this.statusCode = StatusCodes.NOT_FOUND;
    }
}

export class UnauthenticatedError extends CustomError {
    statusCode: StatusCodes;
    constructor(message: string, source: string) {
        super(message, source)
        this.statusCode = StatusCodes.UNAUTHORIZED;
    }
}