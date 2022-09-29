import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { RefreshTokenCommand } from "../commands/refresh-token.command";

export interface RefreshTokenActionProps {
  commandBus: CommandBus;
}

export const refreshTokenActionValidation = celebrate(
  {
    body: Joi.object({
      accessToken: Joi.string().required(),
      refreshToken: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/refresh-token:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Refreshes access token.
 *     requestBody: &refreshTokenRequest
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              accessToken:
 *                type: string
 *                required: true
 *                example: Access token string...
 *              refreshToken:
 *                type: string
 *                required: true
 *                example: Refresh token string...
 *     responses: &refreshTokenResponses
 *       200:
 *         description: Token successfully refreshed.
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 * /api/public/auth/refresh-token:
 *   post:
 *     tags:
 *       - Public
 *     security: []
 *     summary: Refreshes access token.
 *     requestBody: *refreshTokenRequest
 *     responses: *refreshTokenResponses
 */
export const refreshTokenAction =
  ({ commandBus }: RefreshTokenActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    commandBus
      .execute(
        new RefreshTokenCommand({
          accessToken: req.body.accessToken,
          refreshToken: req.body.refreshToken,
        }),
      )
      .then((commandResult) => {
        res.json(commandResult);
      })
      .catch(next);
  };
