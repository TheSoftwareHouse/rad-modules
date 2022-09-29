import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { DeleteUserCommand } from "../commands/delete-user.command";
import { StatusCodes } from "http-status-codes";

export interface DeleteUserActionProps {
  commandBus: CommandBus;
}

export const deleteUserActionValidation = celebrate(
  {
    query: Joi.object({
      userId: Joi.string().guid().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/delete-user:
 *   delete:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Removes a user by id
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *            type: string
 *         required: true
 *         example: ee4b1d3e-463e-49a8-880f-5f3a816b492c
 *     responses:
 *       204:
 *         description: User removed
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
export const deleteUserAction =
  ({ commandBus }: DeleteUserActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.query as any;
    commandBus
      .execute(
        new DeleteUserCommand({
          userId,
        }),
      )
      .then(() => {
        res.status(StatusCodes.NO_CONTENT).type("application/json").send();
      })
      .catch(next);
  };
