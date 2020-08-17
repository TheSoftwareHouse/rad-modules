import { OK } from "http-status-codes";
import { BearerToken } from "../../../../tokens/bearer-token";
import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { HasAccessCommand } from "../commands/has-access.command";

export interface HasAccessActionProps {
  commandBus: CommandBus;
}

export const hasAccessActionValidation = celebrate(
  {
    body: {
      resources: Joi.string().required(),
    },
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *
 * /api/users/has-access:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Verifies whether user has access to a specific resource.
 *     parameters:
 *       - in: body
 *         name: resources
 *         schema:
 *            type: string
 *         required: true
 *         example: resource1
 *     responses:
 *       200:
 *         description: User has access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasAccess:
 *                   type: boolean
 *                   example: false
 *                 forbidden:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["resource1"]
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
export const hasAccessAction = ({ commandBus }: HasAccessActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(
      new HasAccessCommand({
        accessToken: BearerToken.fromHeader(req.headers.authorization),
        resources: req.body.resources as string[],
      }),
    )
    .then((commandResult) => {
      res.status(OK).json(commandResult);
    })
    .catch(next);
};
