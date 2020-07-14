import { HttpError } from "./http.error";
import { FORBIDDEN } from "http-status-codes";

/**
 * @swagger
 *
 * definitions:
 *   ForbiddenError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: Forbidden
 *
 */

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, FORBIDDEN);
  }
}
