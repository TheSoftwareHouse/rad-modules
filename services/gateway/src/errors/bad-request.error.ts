import { HttpError } from "./http.error";
import { BAD_REQUEST } from "http-status-codes";

/**
 * @swagger
 *
 * definitions:
 *   BadRequestError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: Bad request
 *
 */

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, BAD_REQUEST);
  }
}
