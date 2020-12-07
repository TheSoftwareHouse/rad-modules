import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { MeCommand } from "../commands/me.command";

export interface MeActionProps {
  commandBus: CommandBus;
}

export const meActionValidation = celebrate(
  {
    headers: Joi.object(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/public/me:
 *   get:
 *     description: desc
 *     responses:
 *       200:
 *         description: Returns profile object
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
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["attr1", "attr2"]
 *                 resources:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["attr1", "attr2"]
 *       400:
 *         description: Validation Error
 *       500:
 *         description: Internal Server Error
 */
export const meAction = ({ commandBus }: MeActionProps) => (req: Request, res: Response, next: NextFunction) => {
  const { accessToken } = res.locals;

  commandBus
    .execute(new MeCommand({ accessToken }))
    .then((commandResult) => res.json(commandResult))
    .catch(next);
};
