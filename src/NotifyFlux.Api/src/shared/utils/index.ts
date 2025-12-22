import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

export const createCorrelationId = (): string => randomUUID();

export const parsePagination = (input: { readonly limit?: string; readonly skip?: string }, defaults: { readonly limit: number; readonly skip: number }): { readonly limit: number; readonly skip: number } => {
  const limit = Number.parseInt(input.limit ?? "", 10);
  const skip = Number.parseInt(input.skip ?? "", 10);

  return {
    limit: Number.isNaN(limit) ? defaults.limit : limit,
    skip: Number.isNaN(skip) ? defaults.skip : skip
  };
};

export const asyncHandler = <Req extends Request, Res extends Response>(fn: (req: Req, res: Res, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void fn(req as Req, res as Res, next).catch((error) => next(error));
  };
