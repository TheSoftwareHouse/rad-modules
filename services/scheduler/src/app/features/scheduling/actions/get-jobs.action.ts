import { NextFunction, Request, Response } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { GetJobsCommand, GetJobsCommandPayload } from "../commands/get-jobs.command";

export interface GetJobsActionProps {
  commandBus: CommandBus;
}

export const getJobsActionValidation = celebrate(
  {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(1000),
      filter: Joi.object().pattern(
        Joi.string().valid("id", "name", "service", "action", "status", "createdAt", "updatedAt"),
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
        by: Joi.string().valid("name", "service", "action", "status", "createdAt", "updatedAt"),
        type: Joi.string().valid("asc", "desc"),
      }),
    }).unknown(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/scheduling/get-jobs:
 *   get:
 *     tags:
 *       - Scheduling
 *     security: []
 *     summary: Get jobs list (if no query parameters it returns first 25 jobs ordered by name)
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
 *                example: name
 *              type:
 *                type: string
 *                example: asc
 *         allowReserved: true
 *     responses:
 *       200:
 *         description: List of jobs and total count of jobs
 *         example: { "jobs": [{"id": "00000000-0000-0000-0000-000000000001", "name": "test", "service": "security", "action": "addUser", "status": null, "jobOptions": null, "payload": null, "createdAt": "2020-07-16T10:00:00.000Z", "updatedAt": "2020-07-16T10:00:00.000Z" }], "total": 1 }
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: An array of objects
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const getJobsAction = ({ commandBus }: GetJobsActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const defaultOrder = { by: "name", type: "asc" };
  const { page = 1, limit = 25, filter = {}, order = defaultOrder } = req.query as any;
  const queryObject: GetJobsCommandPayload = {
    page: +page,
    limit: +limit,
    filter: filter as any,
    order: order as any,
  };
  commandBus
    .execute(new GetJobsCommand(queryObject))
    .then((commandResult) => {
      res.json(commandResult);
    })
    .catch(next);
};
