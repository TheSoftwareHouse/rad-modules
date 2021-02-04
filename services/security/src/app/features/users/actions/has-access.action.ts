import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { BearerToken } from "../../../../tokens/bearer-token";
import { HasAccessCommand } from "../commands/has-access.command";

export interface HasAccessActionProps {
  commandBus: CommandBus;
}

export const hasAccessActionValidation = celebrate(
  {
    body: Joi.object({
      resources: Joi.array().items(Joi.string().required()).required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *
 * /api/users/has-access:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Verifies whether user has access to a specific resources.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              resources:
 *                type: array
 *                items:
 *                  type: string
 *                required: true
 *                example: ["user-operation/add-user", "user-operation/get-user-id"]
 *     responses:
 *       200:
 *         description: User has access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasAccess:
 *                   type: boolean
 *                   example: false
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
export const hasAccessAction = ({ commandBus }: HasAccessActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new HasAccessCommand({
        accessToken: BearerToken.fromHeader(req.headers.authorization),
        resources: req.body.resources as string[],
      }),
    )
    .then((commandResult) => res.status(StatusCodes.OK).json(commandResult))
    .catch(next);
};
