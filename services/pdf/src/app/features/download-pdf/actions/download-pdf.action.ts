import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { DownloadPdfCommand } from "../commands/download-pdf.command";

export interface DownloadPdfActionProps {
  commandBus: CommandBus;
}

export const downloadPdfActionValidation = celebrate(
  {
    params: Joi.object({
      fileId: Joi.string().guid({ version: "uuidv4" }).required(),
    }),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/download-pdf/{fileId}:
 *   get:
 *     tags:
 *       - PDF
 *     summary: Download PDF file
 *     description: Download PDF file
 *     parameters:
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: A PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: object
 *               format: binary
 *           application/octet-stream:
 *             schema:
 *               type: object
 *               format: binary
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/BadRequestError"
 *       404:
 *         description: Not Found
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
 */
export const downloadPdfAction = ({ commandBus }: DownloadPdfActionProps) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { fileId } = req.params;
  commandBus
    .execute(
      new DownloadPdfCommand({
        fileId,
      }),
    )
    .then((commandResult) => res.download(commandResult.pdfPath))
    .catch(next);
};
