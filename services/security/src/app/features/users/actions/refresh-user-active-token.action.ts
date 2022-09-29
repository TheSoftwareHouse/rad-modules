import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { RefreshUserActiveTokenCommand } from "../commands/refresh-user-active-token.command";
import { StatusCodes } from "http-status-codes";

export interface RefreshUserActiveTokenActionProps {
  commandBus: CommandBus;
}

export const refreshUserActiveTokenActionValidation = celebrate(
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
 * /api/users/refresh-user-active-token:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Refresh user's active token if token has expired.
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
 *         description: User's active token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: access token string...
 *                 refreshToken:
 *                   type: string
 *                   example: refresh token string...
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
 *       403:
 *         description: Forbidden Error the user is already active
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/ForbiddenError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const refreshUserActiveTokenAction =
  ({ commandBus }: RefreshUserActiveTokenActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    commandBus
      .execute(
        new RefreshUserActiveTokenCommand({
          userId,
        }),
      )
      .then((commandResult) => {
        res.status(StatusCodes.OK).json(commandResult);
      })
      .catch(next);
  };
