import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { RemoveUserFromGroupCommand } from "../commands/remove-user-from-group.command";
import { StatusCodes } from "http-status-codes";

export interface RemoveUserFromGroupActionProps {
  commandBus: CommandBus;
}

export const removeUserFromGroupActionValidation = celebrate(
  {
    headers: Joi.object(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/keycloak/remove-user-from-group:
 *   delete:
 *     tags:
 *       - Keycloak
 *     security:
 *       - bearerAuth: []
 *     summary: Removes keycloak group by name
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *            type: string
 *         required: true
 *         example: user@example.com
 *       - in: query
 *         name: group
 *         schema:
 *            type: string
 *         required: true
 *         example: EXAMPLE_GROUP
 *     responses:
 *       204:
 *         description: User was removed from the group
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
 *       404:
 *         description: User and/or group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/NotFoundError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const removeUserFromGroupAction = ({ commandBus }: RemoveUserFromGroupActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new RemoveUserFromGroupCommand({
        username: (req.query as any).username.trim(),
        group: (req.query as any).group.trim(),
      }),
    )
    .then(() => {
      res.status(StatusCodes.NO_CONTENT).send();
    })
    .catch(next);
};
