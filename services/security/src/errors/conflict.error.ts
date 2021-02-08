import { HttpError } from "./http.error";
import { StatusCodes } from "http-status-codes";

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

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT);
  }
}
