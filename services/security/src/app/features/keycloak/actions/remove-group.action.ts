import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { RemoveGroupCommand } from "../commands/remove-group.command";
import { StatusCodes } from "http-status-codes";

export interface RemoveGroupActionProps {
  commandBus: CommandBus;
}

export const removeGroupActionValidation = celebrate(
  {
    query: Joi.object({
      name: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/keycloak/remove-group:
 *   delete:
 *     tags:
 *       - Keycloak
 *     security:
 *       - bearerAuth: []
 *     summary: Removes keycloak group by name
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *            type: string
 *         required: true
 *         example: EXAMPLE_GROUP
 *     responses:
 *       204:
 *         description: Group removed
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
export const removeGroupAction = ({ commandBus }: RemoveGroupActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new RemoveGroupCommand({
        name: (req.query as any).name.trim(),
      }),
    )
    .then(() => {
      res.status(StatusCodes.NO_CONTENT).send();
    })
    .catch(next);
};
