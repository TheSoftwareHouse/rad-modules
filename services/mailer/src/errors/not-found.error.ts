import { HttpError } from "./http.error";
import { StatusCodes } from "http-status-codes";

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
