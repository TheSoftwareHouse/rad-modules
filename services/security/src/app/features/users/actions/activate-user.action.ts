import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { ActivateUserCommand } from "../commands/activate-user.command";

export interface ActivateUserActionProps {
  commandBus: CommandBus;
}

export const activateUserActionValidation = celebrate(
  {
    params: Joi.object({
      activationToken: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/activate-user/{activationToken}:
 *   post:
 *    tags:
 *      - Users
 *    summary: Activate a new user
 *    parameters:
 *      - in: path
 *        name: activationToken
 *        schema:
 *          type: string
 *        required: true
 *    responses:
 *       200:
 *         description: User activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: 45287eff-cdb0-4cd4-8a0f-a07d1a11b382
 *                 isActive:
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
 *       404:
 *         description: Token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/NotFoundError"
 *       410:
 *         description: Token expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/NoLongerAvailableError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const activateUserAction = ({ commandBus }: ActivateUserActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { activationToken } = req.params;
  commandBus
    .execute(
      new ActivateUserCommand({
        activationToken,
      }),
    )
    .then((commandResult) => {
      res.status(200).json(commandResult);
    })
    .catch(next);
};
