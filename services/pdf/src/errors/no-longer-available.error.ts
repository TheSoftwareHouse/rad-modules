import { HttpError } from "./http.error";
import { GONE } from "http-status-codes";

/**
 * @swagger
 *
 * definitions:
 *   NoLongerAvailableError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: No longer available
 *
 */

export class NoLongerAvailableError extends HttpError {
  constructor(message: string) {
    super(message, GONE);
  }
}
