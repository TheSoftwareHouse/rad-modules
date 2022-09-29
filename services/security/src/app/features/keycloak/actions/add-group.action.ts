import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { AddGroupCommand } from "../commands/add-group.command";
import { StatusCodes } from "http-status-codes";

export interface AddGroupActionProps {
  commandBus: CommandBus;
}

export const addGroupActionValidation = celebrate(
  {
    body: Joi.object({
      name: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/keycloak/add-group:
 *   post:
 *     tags:
 *       - Keycloak
 *     security:
 *       - bearerAuth: []
 *     summary: Adds a new keycloak group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                required: true
 *                example: EXAMPLE_GROUP
 *     responses:
 *       201:
 *         description: Group created
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
 *       409:
 *         description: Group already exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/AlreadyExistsError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const addGroupAction =
  ({ commandBus }: AddGroupActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    commandBus
      .execute(
        new AddGroupCommand({
          name: req.body.name.trim(),
        }),
      )
      .then((commandResult) => {
        res.status(StatusCodes.CREATED).json(commandResult);
      })
      .catch(next);
  };
