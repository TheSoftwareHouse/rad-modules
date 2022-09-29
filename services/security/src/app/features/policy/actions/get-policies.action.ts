import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { GetPoliciesCommand, GetPoliciesResponse } from "../commands/get-policies.command";

export interface GetPoliciesActionProps {
  commandBus: CommandBus;
}

export const getPoliciesActionValidation = celebrate(
  {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(1000),
      filter: Joi.object().pattern(
        Joi.string().valid("id", "resource", "attribute"),
        Joi.object({
          include: Joi.string(),
          includeOr: Joi.string(),
          eq: Joi.string(),
          neq: Joi.string(),
          lt: Joi.string(),
          gt: Joi.string(),
        }),
      ),
      order: Joi.object({
        by: Joi.string().valid("resource", "attribute"),
        type: Joi.string().valid("asc", "desc"),
      }),
    }).unknown(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/policy/get-policies:
 *   get:
 *     tags:
 *       - Policy
 *     security:
 *       - bearerAuth: []
 *     summary: Get policies list (if no query parameters returns first 25 policies)
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
 *         example: filter[resource][Like]=%resource%
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *            type: string
 *         example: order[by]=attribute&order[type]=asc
 *     responses:
 *       200:
 *         description: List of policies and total count of policies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 policies:
 *                   type: An array of objects
 *                   example: [{id: "f2fd043c-44d3-49f6-9a5a-c486f9f47258", attribute: "ADMIN_PANEL", resource: "user-operation/add-user"},{id: "262907ad-2ca4-41b6-85f3-c2face7d3318", attribute: "ADMIN_PANEL", resource: "user-operation/get-user-id"}]
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
export const getPoliciesAction =
  ({ commandBus }: GetPoliciesActionProps) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const defaultOrder = { by: "resource", type: "asc" };
    const { page = 1, limit = 25, filter = {}, order = defaultOrder } = req.query as any;
    const queryObject = {
      page,
      limit,
      filter,
      order,
    };
    commandBus
      .execute(new GetPoliciesCommand(queryObject))
      .then((commandResult: GetPoliciesResponse) => res.json(commandResult))
      .catch(next);
  };
