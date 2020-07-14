import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { OauthRedirectCommand } from "../commands/oauth-redirect.command";
import { appConfig } from "../../../../config/config";

export interface OauthRedirectActionProps {
  commandBus: CommandBus;
}

export const oauthRedirectActionDefaultValidation = celebrate(
  {
    params: {
      provider: Joi.string()
        .valid(...appConfig.oauth.enabled)
        .required(),
    },
    query: {
      code: Joi.string().required(),
      redirectUrl: Joi.string().uri().required(),
    },
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/oauth-redirect/{provider}:
 *   get:
 *     tags:
 *       - Users
 *     security: []
 *     summary: oauth-redirect callback
 *     parameters: &oauthParameters
 *       - in: path
 *         name: provider
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: code
 *         schema:
 *            type: string
 *         required: true
 *       - in: query
 *         name: redirectUrl
 *         schema:
 *            type: string
 *         required: true
 *     responses: &oauthResponses
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoaSI6ImhvdyBhcmUgeW91PyA6KSJ9.NYXWEhydNzRrGQD-dhEQL0pi0MIPoOwbGwfOw39wvus
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJob3ciOiJjYW4gSSBoZWxwIHlvdT8ifQ.P7egumkjqupIVmvVgy0rv4rqNOVXSlZvOX5ZiFxNR9w
 *                 username:
 *                   type: string
 *                   example: test.user@test.com
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
 * /api/public/auth/oauth-redirect/{provider}:
 *   post:
 *     tags:
 *       - Public
 *     security: []
 *     summary: oauth-redirect callback
 *     parameters: *oauthParameters
 *     responses: *oauthResponses
 */
export const oauthRedirectAction = ({ commandBus }: OauthRedirectActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { code, redirectUrl } = req.query as any;
  const { provider } = req.params as any;

  commandBus
    .execute(
      new OauthRedirectCommand({
        provider,
        code,
        redirectUrl,
      }),
    )
    .then((commandResult) => {
      res.json(commandResult);
    })
    .catch(next);
};
