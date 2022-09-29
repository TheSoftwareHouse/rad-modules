import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { GetAccessKeysCommand } from "../commands/get-access-keys.command";

export interface GetAccessKeysActionProps {
  commandBus: CommandBus;
}

export const getAccessKeysActionValidation = celebrate(
  {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(1000),
    }).unknown(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/tokens/get-access-keys:
 *   get:
 *     tags:
 *       - Tokens
 *     security:
 *       - bearerAuth: []
 *     summary: Get access keys list (if no query parameters returns first 25 keys)
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         default: 0
 *         schema:
 *            type: number
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         default: 25
 *         schema:
 *            type: number
 *         example: 25
 *     responses:
 *       200:
 *         description: List of access keys and total count of keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessKeys:
 *                   type: An array of objects
 *                   example: [{"id": "cbc078c3-da36-43a7-b364-7f5c48e1fe50","apiKey": "37362ad7-a603-1bcc-808c-a24bfd35883c","type": "custom","createdBy": "superadmin","createdAt": "2020-02-07T11:13:16.184Z"},{"id": "485d2318-5a0e-4b80-bfd1-1b74e1636878","apiKey": "79e596f1-72c9-0afc-cde8-d7acd9cadf9c","type": "custom","createdBy": "superadmin","createdAt": "2020-02-07T11:13:16.431Z"}]
 *                 total:
 *                   type: number
 *                   example: 2
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/BadRequestError"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/UnauthorizedError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const getAccessKeysAction =
  ({ commandBus }: GetAccessKeysActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 25 } = req.query as any;
    commandBus
      .execute(
        new GetAccessKeysCommand({
          page,
          limit,
        }),
      )
      .then((commandResult) => res.json(commandResult))
      .catch(next);
  };
