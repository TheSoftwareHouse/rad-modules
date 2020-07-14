import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { GenerateTokenCommand } from "../commands/generate-token.command";
import { appConfig } from "../../../../config/config";

export interface GenerateTokenActionProps {
  commandBus: CommandBus;
}

export const generateTokenActionValidation = celebrate(
  {
    headers: Joi.object({
      [appConfig.apiKeyHeaderName]: Joi.string().regex(appConfig.apiKeyRegex).required(),
    }).unknown(),
    body: Joi.object({
      accessExpirationInSeconds: Joi.number().positive().required(),
      refreshExpirationInSeconds: Joi.number().positive().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/tokens/generate-token:
 *   post:
 *     tags:
 *       - Tokens
 *     summary: Create new token
 *     description: Creates new token with default policies and attributes without SUPERADMIN_ROLE attribute
 *     parameters:
 *      - $ref: "#/definitions/ApiKeyHeaderName"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessExpirationInSeconds:
 *                 type: number
 *                 required: true
 *                 example: 3600
 *               refreshExpirationInSeconds:
 *                 type: number
 *                 required: true
 *                 example: 3000
 *     responses:
 *       201:
 *         description: Access key created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   default: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM4YzBjNi1jYzI3LTRjOTEtODk0ZS05MDIzMzYyYzMwOTAiLCJ1c2VybmFtZSI6Ijk0N2E1NmEyLWYyNmItNGU5OC1iZjk4LTI5ZWEwOWE0Njk5YyIsImF0dHJpYnV0ZXMiOlsiYXR0cjEiLCJhdHRyMiJdLCJwb2xpY3kiOltdLCJ0eXBlIjoiY3VzdG9tIiwiYWNjZXNzRXhwaXJhdGlvbkluU2Vjb25kcyI6MzYwMCwicmVmcmVzaEV4cGlyYXRpb25JblNlY29uZHMiOjMwMDAsImlhdCI6MTU3ODgzMjA1MCwiZXhwIjoxNTc4ODM1NjUwfQ.C-eAbVXd8GJNTnKmYAT0YZqv4suqSPwHHp7DL48mZag
 *                 refreshToken:
 *                   type: string
 *                   default: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM4YzBjNi1jYzI3LTRjOTEtODk0ZS05MDIzMzYyYzMwOTAiLCJ1c2VybmFtZSI6Ijk0N2E1NmEyLWYyNmItNGU5OC1iZjk4LTI5ZWEwOWE0Njk5YyIsImF0dHJpYnV0ZXMiOlsiYXR0cjEiLCJhdHRyMiJdLCJwb2xpY3kiOltdLCJ0eXBlIjoiY3VzdG9tIiwiYWNjZXNzRXhwaXJhdGlvbkluU2Vjb25kcyI6MzYwMCwicmVmcmVzaEV4cGlyYXRpb25JblNlY29uZHMiOjMwMDAsImlhdCI6MTU3ODgzMjA1MCwiZXhwIjoxNTc4ODM1MDUwfQ.wNzw7dSLux3a3Jf1KRsnGKMBVlMxToz8x2dJu7DWff0
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
export const generateTokenAction = ({ commandBus }: GenerateTokenActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { [appConfig.apiKeyHeaderName]: apiKey = "" } = req.headers;
  const { accessExpirationInSeconds, refreshExpirationInSeconds } = req.body;
  commandBus
    .execute(
      new GenerateTokenCommand({
        apiKey: apiKey as string,
        accessExpirationInSeconds,
        refreshExpirationInSeconds,
      }),
    )
    .then((commandResult) => {
      // response
      res.json(commandResult);
    })
    .catch(next);
};
