import { HttpError } from "./http.error";
import { UNAUTHORIZED } from "http-status-codes";

export class UnathorizedError extends HttpError {
  constructor(message: string) {
    super(message, UNAUTHORIZED);
  }
}
