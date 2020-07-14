import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { GetUsersCommand, GetUsersCommandPayload } from "../commands/get-users.command";
import { UsersResponse } from "../services/users-service";

export interface GetUsersActionProps {
  commandBus: CommandBus;
}

export const getUsersActionValidation = celebrate(
  {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(1000),
      filter: Joi.object().pattern(
        Joi.string().valid("id", "username", "isActive", "createdAt", "updatedAt", "attribute.name"),
        Joi.object({
          include: Joi.string(),
          eq: Joi.string(),
          eqOr: Joi.string(),
          neq: Joi.string(),
          lt: Joi.string(),
          gt: Joi.string(),
        }),
      ),
      order: Joi.object({
        by: Joi.string().valid("username", "isActive", "createdAt", "updatedAt"),
        type: Joi.string().valid("asc", "desc"),
      }),
    }).unknown(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Get users list (if no query parameters returns first 25 users)
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
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *            type: string
 *         allowReserved: true
 *         example: filter[username][include]=superadmin
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *            type: string
 *         allowReserved: true
 *         example: order[by]=username&order[type]=asc
 *     responses:
 *       200:
 *         description: List of users and total count of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: An array of objects
 *                   example: [{"id": "806ab2f0-fb77-4a45-aece-493c8a591ef5","username": "test-user","isActive": true,"activationToken": null,"createdAt": "2020-04-27T09:34:13.424Z","updatedAt": "2020-04-27T09:34:13.424Z","attributes": ["attr1","attr2"],"isSuperAdmin": false}]
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
export const getUsersAction = ({ commandBus }: GetUsersActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const defaultOrder = { by: "username", type: "asc" };
  const { page = 1, limit = 25, filter = {}, order = defaultOrder } = req.query as any;
  const queryObject: GetUsersCommandPayload = {
    page: +page,
    limit: +limit,
    filter: filter as any,
    order: order as any,
  };
  commandBus
    .execute(new GetUsersCommand(queryObject))
    .then((commandResult: UsersResponse) => res.json(commandResult))
    .catch(next);
};
