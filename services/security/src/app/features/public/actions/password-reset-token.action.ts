import { Request, Response } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { PasswordResetTokenCommand } from "../commands/password-reset-token.command";
import { StatusCodes } from "http-status-codes";
import { Logger } from "winston";

export interface PasswordResetTokenActionProps {
  commandBus: CommandBus;
  logger: Logger;
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
 * /api/public/auth/reset-password:
 *   post:
 *     tags:
 *       - Public
 *     security:
 *       - bearerAuth: []
 *     summary: Creates token which will be used to reset the user password
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
 *       202:
 *         description: Token created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               enum:
 *                 - {}
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
export const passwordResetTokenAction = ({ commandBus, logger }: PasswordResetTokenActionProps) => (
  req: Request,
  res: Response,
) => {
  const { username } = req.body;
  try {
    commandBus.execute(
      new PasswordResetTokenCommand({
        username,
      }),
    );
  } catch (error) {
    logger.error(error);
  } finally {
    res.status(StatusCodes.ACCEPTED).json({});
  }
};
