import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { GetAttributesCommand } from "../commands/get-attributes.command";

export interface GetAttributesActionProps {
  commandBus: CommandBus;
}

export const getAttributesActionValidation = celebrate(
  {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(1000),
      filter: Joi.object().pattern(
        /^/,
        Joi.object({
          include: Joi.string().allow(""),
          includeOr: Joi.string().allow(""),
          eq: Joi.string(),
          eqOr: Joi.string(),
          neq: Joi.string(),
          lt: Joi.string(),
          gt: Joi.string(),
        }),
      ),
      order: Joi.object({
        by: Joi.string().valid("user.username", "name"),
        type: Joi.string().valid("asc", "desc"),
      }),
    }).unknown(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/attributes:
 *   get:
 *     tags:
 *       - Attributes
 *     security:
 *       - bearerAuth: []
 *     summary: Get attributes list (if no query parameters returns first 25 attributes)
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
 *         example: filter[username][include]=superadmin
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *            type: string
 *         example: order[by]=name&order[type]=asc
 *     responses:
 *       200:
 *         description: List of attributes and total count of attributes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: An array of objects
 *                   example: [{key: "f2fd043c-44d3-49f6-9a5a-c486f9f47258", name: "attr1", username: "superadmin"}]
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
export const getAttributesAction = ({ commandBus }: GetAttributesActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const defaultOrder = { by: "name", type: "asc" };
  const { page = 1, limit = 25, filter = {}, order = defaultOrder } = req.query as any;
  const queryObject = {
    page,
    limit,
    filter,
    order,
  };
  commandBus
    .execute(new GetAttributesCommand(queryObject))
    .then((commandResult) => res.json(commandResult))
    .catch(next);
};
