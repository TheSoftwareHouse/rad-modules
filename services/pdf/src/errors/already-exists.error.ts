import { HttpError } from "./http.error";
import { CONFLICT } from "http-status-codes";

/**
 * @swagger
 *
 * definitions:
 *   AlreadyExistsError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: Error description
 *
 */

export class AlreadyExistsError extends HttpError {
  constructor(message: string) {
    super(message, CONFLICT);
  }
}
