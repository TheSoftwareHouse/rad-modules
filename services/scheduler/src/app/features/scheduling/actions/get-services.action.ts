import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { GetServicesCommand } from "../commands/get-services.command";

export interface GetServicesActionProps {
  commandBus: CommandBus;
}

export const getServicesActionValidation = celebrate(
  {
    headers: Joi.object(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/scheduling/get-services:
 *   get:
 *     tags:
 *       - Scheduling
 *     security: []
 *     summary: Returns all services and actions that can be run by scheduler
 *     responses:
 *       200:
 *         description: Available services and actions
 *         example: [ { "service": "security", "actions": [ "getPolicies", "getUsers" ]}, { "service": "mailer", "actions": ["send"] } ]
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service:
 *                     type: string
 *                   actions:
 *                     type: array
 *                     items:
 *                       type: string
 *       400:
 *         description: Bad request
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
export const getServicesAction = ({ commandBus }: GetServicesActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  commandBus
    .execute(new GetServicesCommand({}))
    .then((commandResult) => {
      res.json(commandResult);
    })
    .catch(next);
};
