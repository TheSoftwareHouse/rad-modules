import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../../../../shared/command-bus";
import { SendCommand } from "../commands/send.command";
import { CREATED } from "http-status-codes";

export interface SendActionProps {
  commandBus: CommandBus;
}

export const sendActionValidation = celebrate(
  {
    body: Joi.object({
      channels: Joi.array().items(Joi.string().required()).unique(),
      message: Joi.string().required(),
    }).required(),
  },

  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/notifications/send:
 *   post:
 *     tags:
 *       - Notifications
 *     security: []
 *     summary: Send notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              channels:
 *                type: array
 *                items:
 *                  type: string
 *              message:
 *                type: string
 *                required: true
 *     responses:
 *       201:
 *         description: Notification/s created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notificationsIds:
 *                   type: array
 *                   items:
 *                     type: string
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
export const sendAction = ({ commandBus }: SendActionProps) => (req: Request, res: Response, next: NextFunction) => {
  const { channels, message } = req.body;
  commandBus
    .execute(new SendCommand({ channels, message }))
    .then((commandResult) => {
      res.status(CREATED).type("application/json").json(commandResult);
      // response
    })
    .catch(next);
};
