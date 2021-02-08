import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { RemoveAttributeCommand } from "../commands/remove-attribute.command";
import { StatusCodes } from "http-status-codes";

export interface RemoveAttributeActionProps {
  commandBus: CommandBus;
}

export const removeAttributeActionValidation = celebrate(
  {
    query: {
      attributes: Joi.string()
        .regex(/^([^,;]+,?\s*)+$/) // comma-delimited string
        .messages({
          "string.pattern.base":
            'child "attributes" fails because ["attributes" with value "attr1,attr2,,," fails to match the required pattern: /^([^,;]+,?\\s*)+$/]',
        })
        .required(),
      userId: Joi.string().guid().required(),
    },
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/remove-attribute:
 *   delete:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Removes an attribute for a user
 *     parameters:
 *       - in: query
 *         name: attributes
 *         schema:
 *            type: string
 *         required: true
 *         example: attr1
 *       - in: query
 *         name: userId
 *         schema:
 *            type: string
 *         required: true
 *         example: ee4b1d3e-463e-49a8-880f-5f3a816b492c
 *     responses:
 *       204:
 *         description: Deleted successfully
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
 *         description: Attribute not found
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
export const removeAttributeAction = ({ commandBus }: RemoveAttributeActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new RemoveAttributeCommand({
        attributes: (req.query.attributes as string).split(",").map((attribute) => attribute.trim()),
        userId: req.query.userId as string,
      }),
    )
    .then(() => {
      res.status(StatusCodes.NO_CONTENT).type("application/json").send();
    })
    .catch(next);
};
