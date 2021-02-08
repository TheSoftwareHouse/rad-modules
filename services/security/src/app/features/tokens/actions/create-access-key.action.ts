import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { CreateAccessKeyCommand } from "../commands/create-access-key.command";
import { StatusCodes } from "http-status-codes";

export interface CreateAccessKeyActionProps {
  commandBus: CommandBus;
}

export const createAccessKeyActionValidation = celebrate(
  {
    body: Joi.object(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/tokens/create-access-key:
 *   post:
 *     tags:
 *       - Tokens
 *     summary: Create Api Key
 *     description: Returns an api key
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Access key created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: string
 *                   default: uuid v4
 *                   example: 123e4567-e89b-12d3-a456-426655440000
 *                 type:
 *                   type: string
 *                   default: custom
 *                   example: custom
 *                 createdBy:
 *                   type: string
 *                   default: username
 *                   example: superadmin
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
 *
 * definitions:
 *   Tokens:
 *     type: object
 *
 */
export const createAccessKeyAction = ({ commandBus }: CreateAccessKeyActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { accessToken } = res.locals;

  commandBus
    .execute(new CreateAccessKeyCommand({ accessToken }))
    .then((commandResult) => res.status(StatusCodes.CREATED).json(commandResult))
    .catch(next);
};
