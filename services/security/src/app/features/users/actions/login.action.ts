import { CommandBus } from "@tshio/command-bus";
import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { LoginCommand } from "../commands/login.command";

export interface LoginActionProps {
  commandBus: CommandBus;
}

export const loginActionValidation = celebrate(
  {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/login:
 *   post:
 *     tags:
 *       - Users
 *     security: []
 *     summary: Login to app
 *     requestBody: &loginRequest
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                required: true
 *                example: superadmin
 *              password:
 *                type: string
 *                required: true
 *                example: superadmin
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
 *                   example: child "username" fails because ["username" is not allowed to be empty]
 *       401:
 *         description: Unauthorized Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Wrong username or password
 * /api/public/auth/login:
 *   post:
 *     tags:
 *       - Public
 *     security: []
 *     summary: Login to app
 *     requestBody: *loginRequest
 *     responses: *loginResponses
 */
export const loginAction =
  ({ commandBus }: LoginActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    commandBus
      .execute(
        new LoginCommand({
          username: req.body.username,
          password: req.body.password,
        }),
      )
      .then((commandResult) => {
        res.json(commandResult);
      })
      .catch(next);
  };
