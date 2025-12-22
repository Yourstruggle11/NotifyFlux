export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  public constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const notFound = (message: string): HttpError => new HttpError(message, 404);
export const unauthorized = (message: string): HttpError => new HttpError(message, 401);
export const forbidden = (message: string): HttpError => new HttpError(message, 403);
export const badRequest = (message: string): HttpError => new HttpError(message, 400);
