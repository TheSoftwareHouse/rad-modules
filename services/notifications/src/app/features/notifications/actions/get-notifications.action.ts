import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { GetNotificationsCommand, GetNotificationsCommandPayload } from "../commands/get-notifications.command";

export interface GetNotificationsActionProps {
  commandBus: CommandBus;
}

export const getNotificationsActionValidation = celebrate(
  {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(1000),
      filter: Joi.object().pattern(
        Joi.string().valid("id", "channel", "message", "createdAt", "updatedAt"),
        Joi.object({
          include: Joi.string(),
          in: Joi.string(),
          eq: Joi.string(),
          eqOr: Joi.string(),
          neq: Joi.string(),
          lt: Joi.string(),
          gt: Joi.string(),
        }),
      ),
      order: Joi.object({
        by: Joi.string().valid("channel", "message", "createdAt", "updatedAt"),
        type: Joi.string().valid("asc", "desc"),
      }),
    }).unknown(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/notifications/get-notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     security: []
 *     summary: Get notifications list (if no query parameters it returns first 25 notifications ordered by created date)
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         default: 1
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
 *         style: deepObject
 *         explode: true
 *         schema:
 *            type: object
 *         allowReserved: true
 *       - in: query
 *         name: order
 *         required: false
 *         style: deepObject
 *         explode: true
 *         schema:
 *            type: object
 *            properties:
 *              by:
 *                type: string
 *                example: channel
 *              type:
 *                type: string
 *                example: asc
 *         allowReserved: true
 *     responses:
 *       200:
 *         description: List of notifications and total count of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     properties:
 *                      id:
 *                        type: string
 *                        example: 00000000-0000-0000-0000-000000000001
 *                      channel:
 *                        type: string
 *                        example: default-all
 *                      message:
 *                        type: string
 *                        example: Hello
 *                      createdAt:
 *                        type: string
 *                        example: 2020-07-16T10:00:00.000Z
 *                 total:
 *                   type: number
 *                   example: 1
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const getNotificationsAction = ({ commandBus }: GetNotificationsActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const defaultOrder = { by: "createdAt", type: "desc" };
  const { page = 1, limit = 25, filter = {}, order = defaultOrder } = req.query as any;
  const queryObject: GetNotificationsCommandPayload = {
    page: +page,
    limit: +limit,
    filter: filter as any,
    order: order as any,
  };
  commandBus
    .execute(new GetNotificationsCommand(queryObject))
    .then((commandResult) => {
      res.json(commandResult);
    })
    .catch(next);
};
