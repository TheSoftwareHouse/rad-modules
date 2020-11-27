import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { AddUserCommand } from "../commands/add-user.command";
import { appConfig } from "../../../../config/config";
import { CREATED } from "http-status-codes";

export interface AddUserActionProps {
  commandBus: CommandBus;
}

export const addUserActionValidation = celebrate(
  {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string()
        .regex(appConfig.passwordRegex)
        .required()
        .messages({
          "string.pattern.base": `password does not meet criteria: ${appConfig.passwordValidationError}`,
        }),
      attributes: Joi.array().items(Joi.string().required()).unique(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/add-user:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new user
 *     description: Adds a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                required: true
 *                example: test-user
 *              password:
 *                type: string
 *                required: true
 *                example: passw0rd
 *              attributes:
 *                type: array
 *                items:
 *                  type: string
 *                required: false
 *                example: [ADMIN_PANEL, READ_TEST_RESOURCE]
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newUserId:
 *                   type: string
 *                   example: 45287eff-cdb0-4cd4-8a0f-a07d1a11b382
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
 *       409:
 *         description: Already Exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/AlreadyExistsError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const addUserAction = ({ commandBus }: AddUserActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, password, attributes } = req.body;
  commandBus
    .execute(new AddUserCommand({ username, password, attributes }))
    .then((commandResult) => {
      res.status(CREATED).json(commandResult);
    })
    .catch(next);
};
