import { HttpError } from "./http.error";
import { StatusCodes } from "http-status-codes";

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
    super(message, StatusCodes.NOT_FOUND);
  }
}
