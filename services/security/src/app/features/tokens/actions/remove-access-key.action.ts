import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { RemoveAccessKeyCommand } from "../commands/remove-access-key.command";
import { StatusCodes } from "http-status-codes";

export interface RemoveAccessKeyActionProps {
  commandBus: CommandBus;
}

export const removeAccessKeyActionValidation = celebrate(
  {
    params: Joi.object({
      apiKey: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/tokens/remove-access-key/{apiKey}:
 *   delete:
 *     tags:
 *       - Tokens
 *     summary: Remove api key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKey
 *         description: ApiKey that should be deleted
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       204:
 *         description: Api key removed
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/UnauthorizedError"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/BadRequestError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const removeAccessKeyAction = ({ commandBus }: RemoveAccessKeyActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { apiKey } = req.params;
  commandBus
    .execute(
      new RemoveAccessKeyCommand({
        apiKey,
      }),
    )
    .then(() => res.status(StatusCodes.NO_CONTENT).type("application/json").send())
    .catch(next);
};
