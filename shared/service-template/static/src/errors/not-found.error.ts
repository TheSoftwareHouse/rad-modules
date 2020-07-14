import { HttpError } from "./http.error";
import { NOT_FOUND } from "http-status-codes";

/**
 * @swagger
 *
 * definitions:
 *   NotFoundError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: Not found
 *
 */

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, NOT_FOUND);
  }
}
