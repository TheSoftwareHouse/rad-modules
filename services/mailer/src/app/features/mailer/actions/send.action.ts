import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { SendCommand } from "../commands/send.command";
import { StatusCodes } from "http-status-codes";
import { EmailQueuePriority } from "../../../../utils/worker/email-queue";

export interface SendActionProps {
  commandBus: CommandBus;
}

export const sendActionValidation = celebrate(
  {
    body: Joi.object({
      emails: Joi.array()
        .items(
          Joi.object({
            sender: Joi.object({
              name: Joi.string().min(1).max(255).required(),
              email: Joi.string().max(255).email().required(),
            }).required(),
            recipient: Joi.object({
              to: Joi.array().items(Joi.string().max(255).email().required()).required(),
              cc: Joi.array().items(Joi.string().max(255).email().required()).optional(),
              bcc: Joi.array().items(Joi.string().max(255).email().required()).optional(),
            }).required(),
            template: Joi.object({
              id: Joi.string().max(255).required(),
              parameters: Joi.object().required(),
            }).required(),
            attachments: Joi.array()
              .items(
                Joi.object({
                  fileName: Joi.string().min(1).required(),
                  content: Joi.string().base64().required(),
                }),
              )
              .optional(),
          }),
        )
        .required(),
      priority: Joi.string().valid("urgent", "high", "medium", "low"),
    }),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/mailer/send:
 *   post:
 *     tags:
 *       - Mailer
 *     summary: Send email
 *     description: Send an email via SMTP to multiple recipients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["emails"]
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   properties:
 *                    sender:
 *                      type: object
 *                      required: ["name", "email"]
 *                      properties:
 *                        name:
 *                          type: string
 *                          example: example
 *                        email:
 *                          type: string
 *                          example: example@example.com
 *                    recipient:
 *                      type: object
 *                      required: ["to"]
 *                      properties:
 *                        to:
 *                          type: array
 *                          items:
 *                            type: string
 *                          example: ["example@example.com"]
 *                        cc:
 *                          type: array
 *                          items:
 *                            type: string
 *                          example: ["example2@example.com"]
 *                        bcc:
 *                          type: array
 *                          items:
 *                            type: string
 *                          example: ["example3@example.com"]
 *                    template:
 *                      type: object
 *                      required: ["id", "parameters"]
 *                      properties:
 *                        id:
 *                          type: string
 *                          example: test
 *                        parameters:
 *                          type: object
 *                          example: { param1: "test1", param2: "test2"}
 *                    attachments:
 *                      type: array
 *                      items:
 *                        type: object
 *                        required: ["fileName", "content"]
 *                        properties:
 *                          fileName:
 *                            type: string
 *                            example: "test-file-name"
 *                          content:
 *                            type: string
 *                            example: "IA=="
 *               priority:
 *                 type: number
 *                 description: The priority of email send. Urgent value is default and means immediate send.
 *                 required: false
 *                 enum: [urgent, high, medium, low]
 *                 default: urgent
 *     responses:
 *       201:
 *         description: Mails have been sent
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
export const sendAction =
  ({ commandBus }: SendActionProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { emails, priority = EmailQueuePriority.URGENT } = req.body;

    commandBus
      .execute(new SendCommand({ emails, priority }))
      .then(() => res.sendStatus(StatusCodes.CREATED))
      .catch(next);
  };
