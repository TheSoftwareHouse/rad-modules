import { AppError } from "./app.error";

/**
 * @swagger
 *
 * definitions:
 *   InternalServerError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: "Error description"
 *
 */

export class HttpError extends AppError {
  constructor(message: string, public status: number) {
    super(message);
  }
}
