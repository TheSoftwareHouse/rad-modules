import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { RemovePolicyCommand } from "../commands/remove-policy.command";
import { StatusCodes } from "http-status-codes";

export interface RemovePolicyActionProps {
  commandBus: CommandBus;
}

export const removePolicyActionValidation = celebrate(
  {
    query: Joi.alternatives().try(
      Joi.object({
        id: Joi.string().required(),
      }),
      Joi.object({
        resource: Joi.string().required(),
        attribute: Joi.string().required(),
      }),
    ),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/policy/remove-policy:
 *   delete:
 *     tags:
 *       - Policy
 *     security:
 *       - bearerAuth: []
 *     summary: Removes a policy (identified either by id or resource and attribute)
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *            type: string
 *         example: 9540c4b4-bbf7-479d-aa58-4bddc1200d9c
 *       - in: query
 *         name: resource
 *         schema:
 *            type: string
 *         example: res1
 *       - in: query
 *         name: attribute
 *         schema:
 *            type: string
 *         example: attr1
 *     responses:
 *       204:
 *         description: Policy removed
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
 *         description: Policy not found
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
export const removePolicyAction = ({ commandBus }: RemovePolicyActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, resource, attribute } = req.query as any;
  commandBus
    .execute(
      new RemovePolicyCommand({
        id,
        resource,
        attribute,
      }),
    )
    .then(() => {
      res.status(StatusCodes.NO_CONTENT).send();
    })
    .catch(next);
};
