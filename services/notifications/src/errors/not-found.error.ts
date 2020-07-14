import { HttpError } from "./http.error";
import { NOT_FOUND } from "http-status-codes";

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, NOT_FOUND);
  }
}
