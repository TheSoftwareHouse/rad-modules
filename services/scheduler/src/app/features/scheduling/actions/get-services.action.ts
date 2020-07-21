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
 *     description: desc
 *     responses:
 *       201:
 *         description: desc
 *       400:
 *         description: Validation Error
 *       500:
 *         description: Internal Server Error
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
