import { ErrorRequestHandler } from "express";
import { isCelebrate } from "celebrate";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { HttpError } from "../errors/http.error";

const stackIfDev = (stack?: string) => (process.env.NODE_ENV === "production" ? undefined : stack);

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (isCelebrate(err)) {
    console.log({ err });
    console.log(JSON.stringify(err.joi.details));
    console.log(JSON.stringify(err.err));
    return res.status(BAD_REQUEST).json({
      error: err.joi,
      stack: stackIfDev(err.stack),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      stack: stackIfDev(err.stack),
    });
  }

  return res.status(INTERNAL_SERVER_ERROR).json({
    error: "Internal server error",
    stack: stackIfDev(`$Error: ${err.message}\nStack trace: ${err.stack}`),
  });
};
