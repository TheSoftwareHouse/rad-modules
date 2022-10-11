import { CommandBus } from "@tshio/command-bus";
import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { LogoutCommand } from "../commands/logout.command";

export interface LogoutActionProps {
  commandBus: CommandBus;
}

export const logoutActionValidation = celebrate(
  {
    body: Joi.object({
      refreshToken: Joi.string().max(2048).required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/logout:
 *   post:
 *     tags:
 *       - Users
 *     security: []
 *     summary: Logout from app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *                required: true
 *                example: eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmMWRlNDJlNi0xNGFjLTQ4N2UtOGI3My02YzAxYjA2NjAxNzUifQ.eyJpYXQiOjE2NjQyODE5MjIsImp0aSI6ImY2MDNhZTc5LTc2MGQtNGZmMS1hZGE1LWM2MzExYWIxZWQ0MSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDkwL2F1dGgvcmVhbG1zL3JhZC1zZWN1cml0eS1hdXRoIiwiYXVkIjoiaHR0cDovL2tleWNsb2FrOjgwOTAvYXV0aC9yZWFsbXMvcmFkLXNlY3VyaXR5LWF1dGgiLCJzdWIiOiIwYTY1N2MzOC0zZjlmLTRiZjgtODE0MC05NWU3OTgwNmE1MGEiLCJ0eXAiOiJPZmZsaW5lIiwiYXpwIjoicmFkLXNlY3VyaXR5Iiwic2Vzc2lvbl9zdGF0ZSI6IjA3MzRhOTNjLTI1MjgtNDE5Mi04MGMwLTVlMWI0NmM3MTU4ZiIsInNjb3BlIjoib3BlbmlkIGF0dHJpYnV0ZXMgZW1haWwgb2ZmbGluZV9hY2Nlc3Mgc2VjdXJpdHktc2VydmljZSBwcm9maWxlIn0.XeoxDnaH6a7Qw132_pGEW4VV0xzhGebdv1_BSegipHo
 *     responses:
 *       200:
 *        description: Logout success
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: field "refresh" fails because ["refreshToken" is not allowed to be empty] or [Operation is not supported]
 */

/**
 * @swagger
 *
 * /api/public/auth/logout:
 *   post:
 *     tags:
 *       - Public
 *     security: []
 *     summary: Logout from app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *                required: true
 *                example: eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmMWRlNDJlNi0xNGFjLTQ4N2UtOGI3My02YzAxYjA2NjAxNzUifQ.eyJpYXQiOjE2NjQyODE5MjIsImp0aSI6ImY2MDNhZTc5LTc2MGQtNGZmMS1hZGE1LWM2MzExYWIxZWQ0MSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDkwL2F1dGgvcmVhbG1zL3JhZC1zZWN1cml0eS1hdXRoIiwiYXVkIjoiaHR0cDovL2tleWNsb2FrOjgwOTAvYXV0aC9yZWFsbXMvcmFkLXNlY3VyaXR5LWF1dGgiLCJzdWIiOiIwYTY1N2MzOC0zZjlmLTRiZjgtODE0MC05NWU3OTgwNmE1MGEiLCJ0eXAiOiJPZmZsaW5lIiwiYXpwIjoicmFkLXNlY3VyaXR5Iiwic2Vzc2lvbl9zdGF0ZSI6IjA3MzRhOTNjLTI1MjgtNDE5Mi04MGMwLTVlMWI0NmM3MTU4ZiIsInNjb3BlIjoib3BlbmlkIGF0dHJpYnV0ZXMgZW1haWwgb2ZmbGluZV9hY2Nlc3Mgc2VjdXJpdHktc2VydmljZSBwcm9maWxlIn0.XeoxDnaH6a7Qw132_pGEW4VV0xzhGebdv1_BSegipHo
 *     responses:
 *       200:
 *        description: Logout success
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: field "refresh" fails because ["refreshToken" is not allowed to be empty] or [Operation is not supported]
 */
export const logoutAction =
  ({ commandBus }: LogoutActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    commandBus
      .execute(
        new LogoutCommand({
          refreshToken: req.body.refreshToken,
        }),
      )
      .then((commandResult) => {
        res.json(commandResult);
      })
      .catch(next);
  };
