import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { AddUserToGroupCommand } from "../commands/add-user-to-group.command";
import { StatusCodes } from "http-status-codes";

export interface AddUserToGroupActionProps {
  commandBus: CommandBus;
}

export const addUserToGroupActionValidation = celebrate(
  {
    body: Joi.object({
      username: Joi.string().required(),
      group: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/keycloak/add-user-to-group:
 *   post:
 *     tags:
 *       - Keycloak
 *     security:
 *       - bearerAuth: []
 *     summary: Adds user to keycloak group
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
 *                example: user@example.com
 *              group:
 *                type: string
 *                required: true
 *                example: EXAMPLE_GROUP
 *     responses:
 *       201:
 *         description: User added
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
export const addUserToGroupAction = ({ commandBus }: AddUserToGroupActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new AddUserToGroupCommand({
        username: req.body.username.trim(),
        group: req.body.group.trim(),
      }),
    )
    .then((commandResult) => {
      res.status(StatusCodes.CREATED).json(commandResult);
    })
    .catch(next);
};
