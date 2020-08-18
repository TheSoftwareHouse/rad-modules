import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { HasAttributeCommand } from "../commands/has-attribute.command";
import { BearerToken } from "../../../../tokens/bearer-token";

export interface HasAttributeActionProps {
  commandBus: CommandBus;
}

export const hasAttributeActionValidation = celebrate(
  {
    body: Joi.object({
      attributes: Joi.array().items(Joi.string().required()).required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 *
 * /api/users/has-attributes:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Verifies whether user has attributes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              attributes:
 *                type: array
 *                items:
 *                  type: string
 *                required: true
 *                example: ["ADMIN_PANEL"]
 *     responses:
 *       200:
 *         description: Returns an object determining whether user has all attributes and a list of owned attributes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasAllAttributes:
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
export const hasAttributeAction = ({ commandBus }: HasAttributeActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new HasAttributeCommand({
        accessToken: BearerToken.fromHeader(req.headers.authorization),
        attributes: req.body.attributes,
      }),
    )
    .then((commandResult) => {
      res.json(commandResult);
    })
    .catch(next);
};
