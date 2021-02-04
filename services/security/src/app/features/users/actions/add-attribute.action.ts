import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { AddAttributeCommand } from "../commands/add-attribute.command";

export interface AddAttributeActionProps {
  commandBus: CommandBus;
}

export const addAttributeActionValidation = celebrate(
  {
    body: Joi.object({
      userId: Joi.string().guid().required(),
      attributes: Joi.array().items(Joi.string().required()).unique().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/add-attribute:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Adds a new attribute for a given user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              userId:
 *                type: string
 *                required: true
 *                example: ee4b1d3e-463e-49a8-880f-5f3a816b492c
 *              attributes:
 *                type: array
 *                items:
 *                  type: string
 *                required: true
 *                example: [attr1, attr2]
 *     responses:
 *       201:
 *         description: Attribute created
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/NotFoundError"
 *       409:
 *         description: Already Exists
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
export const addAttributeAction = ({ commandBus }: AddAttributeActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new AddAttributeCommand({
        attributes: req.body.attributes.map((attribute: string) => attribute.trim()),
        userId: req.body.userId.trim(),
      }),
    )
    .then(() => {
      res.status(StatusCodes.CREATED).type("application/json").json({});
    })
    .catch(next);
};
