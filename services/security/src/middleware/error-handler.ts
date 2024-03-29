import { ErrorRequestHandler } from "express";
import { isCelebrateError } from "celebrate";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "../errors/http.error";

const stackIfDev = (stack?: string) => (process.env.NODE_ENV === "production" ? undefined : stack);

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (isCelebrateError(err)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: {
        message: err.message,
        details: [...err.details].map(([_key, errorItem]) => errorItem.details).flat(),
      },
      stack: stackIfDev(err.stack),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      stack: stackIfDev(err.stack),
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: "Internal server error",
    stack: stackIfDev(`$Error: ${err.message}\nStack trace: ${err.stack}`),
  });
};
