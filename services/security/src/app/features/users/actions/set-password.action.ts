import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { SetPasswordCommand } from "../commands/set-password.command";
import { appConfig } from "../../../../config/config";
import { JwtUtils } from "../../../../tokens/jwt-utils";
import { AuthorizationClient } from "../../../../ACL/authorization-client.types";

export interface SetPasswordActionProps {
  commandBus: CommandBus;
  jwtUtils: JwtUtils;
  authorizationClient: AuthorizationClient;
}

export const setPasswordActionValidation = celebrate(
  {
    body: Joi.object({
      username: Joi.string(),
      oldPassword: Joi.string().allow(""),
      newPassword: Joi.string()
        .empty()
        .required()
        .regex(appConfig.passwordRegex)
        .messages({
          "string.pattern.base": `newPassword does not meet criteria: ${appConfig.passwordValidationError}`,
        }),
    }),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/set-password:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Set user password
 *     description: If a normal user wants to change his password the user needs to send newPassword and oldPassword. If an admin user wants to set a new password for a user, the admin needs to send username and newPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                required: false
 *              oldPassword:
 *                type: string
 *                required: false
 *              newPassword:
 *                type: string
 *                required: true
 *            example:
 *              normal-user:
 *                body:
 *                  newPassword: 87654321cba
 *                  oldPassword: abc12345678
 *              admin-user:
 *                body:
 *                  newPassword: 87654321cba
 *                  username: user1
 *     responses:
 *       200:
 *        description: Set new password success
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 passwordChanged:
 *                   type: boolean
 *                   example: true
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
export const setPasswordAction = ({ commandBus, jwtUtils, authorizationClient }: SetPasswordActionProps) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { oldPassword, newPassword, username: usernameWhomAdminChangePassword } = req.body;
  const { accessToken } = res.locals;
  try {
    const { username: usernameToSelfPasswordChange } = jwtUtils.tryToGetPayloadFromTokenOrThrow(accessToken);
    const isSuperAdmin = await authorizationClient.isSuperAdmin(accessToken);

    const commandResult = await commandBus.execute(
      new SetPasswordCommand({
        oldPassword,
        newPassword,
        usernameWhomAdminChangePassword,
        usernameToSelfPasswordChange,
        isSuperAdmin,
      }),
    );

    res.json(commandResult);
  } catch (err) {
    next(err);
  }
};
