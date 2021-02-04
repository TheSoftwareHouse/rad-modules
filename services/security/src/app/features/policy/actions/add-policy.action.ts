import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { AddPolicyCommand } from "../commands/add-policy.command";

export interface AddPolicyActionProps {
  commandBus: CommandBus;
}

export const addPolicyActionValidation = celebrate(
  {
    body: Joi.object({
      resource: Joi.string().required(),
      attribute: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/policy/add-policy:
 *   post:
 *     tags:
 *       - Policy
 *     security:
 *       - bearerAuth: []
 *     summary: Adds a new policy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              resource:
 *                type: string
 *                required: true
 *                example: res1
 *              attribute:
 *                type: string
 *                required: true
 *                example: attr1
 *     responses:
 *       201:
 *         description: New policy created id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: f2fd043c-44d3-49f6-9a5a-c486f9f47258
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
 *         description: Policy already exist
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
export const addPolicyAction = ({ commandBus }: AddPolicyActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new AddPolicyCommand({
        resource: req.body.resource.trim(),
        attribute: req.body.attribute.trim(),
      }),
    )
    .then((commandResult) => {
      res.status(StatusCodes.CREATED).json(commandResult);
    })
    .catch(next);
};
