import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { DeactivateUserCommand } from "../commands/deactivate-user.command";
import { OK } from "http-status-codes";

export interface DeactivateUserActionProps {
  commandBus: CommandBus;
}

export const deactivateUserActionValidation = celebrate(
  {
    body: Joi.object({
      userId: Joi.string().guid().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/deactivate-user:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Deactivate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              userId:
 *                type: string
 *                required: true
 *                example: ee4b1d3e-463e-49a8-880f-5f3a816b492c
 *     responses:
 *       200:
 *         description: User deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: 45287eff-cdb0-4cd4-8a0f-a07d1a11b382
 *                 isActive:
 *                   type: boolean
 *                   example: false
 *                 deactivationDate:
 *                   type: string
 *                   example: 2020-01-12T13:36:39.373Z
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
export const deactivateUserAction = ({ commandBus }: DeactivateUserActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.body;
  commandBus
    .execute(
      new DeactivateUserCommand({
        userId,
      }),
    )
    .then((commandResult) => {
      res.status(OK).json(commandResult);
    })
    .catch(next);
};
