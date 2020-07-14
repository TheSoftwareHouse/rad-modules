import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { GetUsersByResourceCommand } from "../commands/get-users-by-resource.command";
import { OK } from "http-status-codes";

export interface GetUsersByResourceActionProps {
  commandBus: CommandBus;
}

export const getUsersByResourceActionValidation = celebrate(
  {
    query: Joi.object({
      resource: Joi.string().required(),
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(1000),
    }).unknown(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/get-users-by-resource:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Get users by resource name
 *     parameters:
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         required: true
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
 *     responses:
 *       200:
 *         description: Users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: An array of objects
 *                   example: [{"id": "806ab2f0-fb77-4a45-aece-493c8a591ef5","username": "test-user","isActive": true,"createdAt": "2020-04-27T09:34:13.424Z","updatedAt": "2020-04-28T09:34:13.424Z","attributes": ["attr1","attr2"],"isSuperAdmin": false}]
 *                 total:
 *                   type: number
 *                   example: 2
 *                 page:
 *                   type: number
 *                   example: 1
 *                 limit:
 *                   type: number
 *                   example: 25
 *       400:
 *         description: Bad Request
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
export const getUsersByResourceAction = ({ commandBus }: GetUsersByResourceActionProps) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page = 1, limit = 25, resource = "" } = req.query as any;
  commandBus
    .execute(
      new GetUsersByResourceCommand({
        resourceName: resource,
        page: +page,
        limit: +limit,
      }),
    )
    .then((commandResult) => res.status(OK).json(commandResult))
    .catch(next);
};
