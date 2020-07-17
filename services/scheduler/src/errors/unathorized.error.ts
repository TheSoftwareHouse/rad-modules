import { HttpError } from "./http.error";
import { UNAUTHORIZED } from "http-status-codes";

/**
 * @swagger
 *
 * definitions:
 *   UnauthorizedError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: Token missing or invalid token format
 *
 */

export class UnathorizedError extends HttpError {
  constructor(message: string) {
    super(message, UNAUTHORIZED);
  }
}
