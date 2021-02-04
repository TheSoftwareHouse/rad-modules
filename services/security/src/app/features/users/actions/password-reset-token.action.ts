import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { PasswordResetTokenCommand } from "../commands/password-reset-token.command";
import { StatusCodes } from "http-status-codes";

export interface PasswordResetTokenActionProps {
  commandBus: CommandBus;
}

export const passwordResetTokenActionValidation = celebrate(
  {
    body: Joi.object({
      username: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/password-reset-token:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Returns token which will be used to reset the user password
 *     description: Create a password reset token with will be used to find if the user started action to change password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                required: true
 *                example: test-user
 *     responses:
 *       201:
 *         description: Token created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resetPasswordToken:
 *                   type: string
 *                   example: 45287eff-cdb0-4cd4-8a0f-a07d1a11b382
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
export const passwordResetTokenAction = ({ commandBus }: PasswordResetTokenActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username } = req.body;
  commandBus
    .execute(
      new PasswordResetTokenCommand({
        username,
      }),
    )
    .then((commandResult) => {
      res.status(StatusCodes.CREATED).json(commandResult);
    })
    .catch(next);
};
