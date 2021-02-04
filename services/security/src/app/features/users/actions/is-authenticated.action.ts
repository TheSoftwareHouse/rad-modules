import { BearerToken } from "../../../../tokens/bearer-token";
import { Request, Response, NextFunction } from "express";
import { CommandBus } from "@tshio/command-bus";
import { IsAuthenticatedCommand } from "../commands/is-authenticated.command";
import { OK, UNAUTHORIZED } from "http-status-codes";

export interface IsAuthenticatedActionProps {
  commandBus: CommandBus;
}

/**
 * @swagger
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 *
 * /api/users/is-authenticated:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Verifies if user is authenticated
 *     responses:
 *       200:
 *         description: Is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   example: true
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
export const isAuthenticatedAction = ({ commandBus }: IsAuthenticatedActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(new IsAuthenticatedCommand({ accessToken: BearerToken.fromHeader(req.headers.authorization) }))
    .then((commandResult) => {
      const status = commandResult && commandResult.isAuthenticated ? OK : UNAUTHORIZED;
      res.status(status).json(commandResult);
    })
    .catch(next);
};
