import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { GetUserCommand } from "../commands/get-user.command";
import { StatusCodes } from "http-status-codes";
import { AuthorizationClient } from "../../../../ACL/authorization-client.types";

export interface GetUserActionProps {
  commandBus: CommandBus;
  authorizationClient: AuthorizationClient;
}

export const getUserActionValidation = celebrate(
  {
    params: Joi.object({
      userId: Joi.string().guid().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/get-user/{userId}:
 *   get:
 *    tags:
 *      - Users
 *    summary: Get user
 *    parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *    responses:
 *       200:
 *         description: User object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 806ab2f0-fb77-4a45-aece-493c8a591ef5
 *                 username:
 *                   type: string
 *                   example: test-user
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 createdAt:
 *                   type: string
 *                   example: 2020-04-27T09:34:13.424Z
 *                 updatedAt:
 *                   type: string
 *                   example: 2020-04-28T09:34:13.424Z
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["attr1", "attr2"]
 *                 isSuperAdmin:
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
 *       404:
 *         description: User not found
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
export const getUserAction = ({ commandBus, authorizationClient }: GetUserActionProps) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params;
  const { accessToken, apiKey } = res.locals;
  const isSuperAdmin = apiKey ? true : await authorizationClient.isSuperAdmin(accessToken);

  commandBus
    .execute(
      new GetUserCommand({
        userId,
        isSuperAdmin,
      }),
    )
    .then((commandResult) => res.status(StatusCodes.OK).json(commandResult))
    .catch(next);
};
