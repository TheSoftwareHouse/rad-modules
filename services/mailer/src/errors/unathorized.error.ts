import { HttpError } from "./http.error";
import { StatusCodes } from "http-status-codes";

export class UnathorizedError extends HttpError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
