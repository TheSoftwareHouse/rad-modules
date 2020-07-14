import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { LoginGoogleIdTokenCommand } from "../commands/login-google-id-token.command";
import { appConfig, OauthProvider } from "../../../../config/config";
import { HttpError } from "../../../../errors/http.error";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";

export interface LoginGoogleIdTokenActionProps {
  commandBus: CommandBus;
}

export const loginGoogleIdTokenActionValidation = celebrate(
  {
    body: {
      idToken: Joi.string().required(),
    },
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/public/login-google-id-token:
 *   post:
 *     tags:
 *       - Public
 *     security: []
 *     summary: Login to app using Google id_token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              idToken:
 *                type: string
 *                required: true
 *                example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNzQ4Zjc0MC1lOWRiLTQxYTMtOGJlNy04OTJlMWY5MzViYzgiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJhdHRyaWJ1dGVzIjpbIlJPTEVfU1VQRVJBRE1JTiJdLCJwb2xpY3kiOltdLCJ0eXBlIjoidXNlciIsImlhdCI6MTU4MzQ5ODIxNCwiZXhwIjoxNTgzNTA4MjE0fQ.LU3DKnwjzmqIMlxni0bwFNH4-MpjRp6dvt7cXztvQIc
 *     responses: &loginResponses
 *       200:
 *        description: auth success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *                  example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNzQ4Zjc0MC1lOWRiLTQxYTMtOGJlNy04OTJlMWY5MzViYzgiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJhdHRyaWJ1dGVzIjpbIlJPTEVfU1VQRVJBRE1JTiJdLCJwb2xpY3kiOltdLCJ0eXBlIjoidXNlciIsImlhdCI6MTU4MzQ5ODIxNCwiZXhwIjoxNTgzNTA4MjE0fQ.LU3DKnwjzmqIMlxni0bwFNH4-MpjRp6dvt7cXztvQIc
 *                refreshToken:
 *                  type: string
 *                  example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNzQ4Zjc0MC1lOWRiLTQxYTMtOGJlNy04OTJlMWY5MzViYzgiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJhdHRyaWJ1dGVzIjpbIlJPTEVfU1VQRVJBRE1JTiJdLCJwb2xpY3kiOltdLCJ0eXBlIjoidXNlciIsImlhdCI6MTU4MzQ5ODIxNCwiZXhwIjoxNTgzNDk5MTE0fQ.tUSn6ktZRB8z1X7Q7QiMtQK7JFGI-AKJMcltlZaOR0U
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: child "idToken" fails because ["idToken" is not allowed to be empty]
 *       401:
 *         description: Unauthorized Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
export const loginGoogleIdTokenAction = ({ commandBus }: LoginGoogleIdTokenActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { idToken } = req.body;
  if (!appConfig.oauth.enabled.includes(OauthProvider.GOOGLE)) {
    throw new HttpError("Login with id_token is disabled (appConfig.oauth.enabled)", INTERNAL_SERVER_ERROR);
  }
  commandBus
    .execute(
      new LoginGoogleIdTokenCommand({
        idToken,
      }),
    )
    .then((commandResult) => res.json(commandResult))
    .catch(next);
};
