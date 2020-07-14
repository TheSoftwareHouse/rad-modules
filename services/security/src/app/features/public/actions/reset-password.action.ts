import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { ResetPasswordCommand } from "../commands/reset-password.command";
import { appConfig } from "../../../../config/config";
import { CREATED } from "http-status-codes";

export interface ResetPasswordActionProps {
  commandBus: CommandBus;
}

export const resetPasswordActionValidation = celebrate(
  {
    params: {
      resetPasswordToken: Joi.string().required(),
    },
    body: {
      newPassword: Joi.string()
        .regex(appConfig.passwordRegex)
        .error(
          (errors: any) =>
            new Error(
              errors.map((e: any) => `${e.context.label} does not meet criteria: ${appConfig.passwordValidationError}`),
            ),
        ),
    },
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/public/auth/reset-password/{resetPasswordToken}:
 *   post:
 *     tags:
 *       - Public
 *     security: []
 *     summary: Reset user password
 *     description: If a user wants to reset the password without providing old one first the user needs to receive "resetPasswordToken" from /password-reset-token endpoint. After that user need to send newPassword and to valid URL with resetPasswordToken in parameter. If the user won't provide newPassword in the body the password will be generated randomly
 *     parameters:
 *       - in: query
 *         name: resetPasswordToken
 *         schema:
 *            type: string
 *         example: 110b7890b25bbtEsTtoKenc7760e8ac2e247b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              newPassword:
 *                type: string
 *                example: passw0rd
 *     responses:
 *       201:
 *        description: Returns password when generater otherwise empty body
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                newPassword:
 *                  type: string
 *                  example: passw0rd
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
export const resetPasswordAction = ({ commandBus }: ResetPasswordActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { newPassword } = req.body;
  const { resetPasswordToken } = req.params;

  commandBus
    .execute(
      new ResetPasswordCommand({
        resetPasswordToken,
        newPassword,
      }),
    )
    .then((commandResult) => {
      if (commandResult) {
        res.status(CREATED).json({});
        return;
      }

      res.status(CREATED).json(commandResult);
    })
    .catch(next);
};
