import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { CancelJobCommand } from "../commands/cancel-job.command";
import { StatusCodes } from "http-status-codes";

export interface CancelJobActionProps {
  commandBus: CommandBus;
}

export const cancelJobActionValidation = celebrate(
  {
    query: {
      jobId: Joi.string().guid({ version: "uuidv4" }).required(),
    },
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/scheduling/cancel-job:
 *   delete:
 *     tags:
 *       - Scheduling
 *     security: []
 *     summary: Cancels a job with given id
 *     parameters:
 *       - in: query
 *         name: jobId
 *         schema:
 *            type: string
 *         required: true
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       204:
 *         description: Job cancelled
 *       400:
 *         description: Bad Request
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
export const cancelJobAction = ({ commandBus }: CancelJobActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { jobId: id } = req.query as any;
  commandBus
    .execute(
      new CancelJobCommand({
        id,
      }),
    )
    .then(() => {
      res.status(StatusCodes.NO_CONTENT).type("application/json").send();
    })
    .catch(next);
};
