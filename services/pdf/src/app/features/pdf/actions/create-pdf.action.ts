import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "@tshio/command-bus";
import { CreatePdfCommand } from "../commands/create-pdf.command";
import { CREATED } from "http-status-codes";
import { AppConfig } from "../../../../config/config";

export interface CreatePdfActionProps {
  commandBus: CommandBus;
  config: AppConfig;
}

export const createPdfActionValidation = celebrate(
  {
    body: Joi.object({
      type: Joi.string().valid("uri", "html"),
      from: Joi.string().when("type", { is: "uri", then: Joi.string().uri() }),
      pdfOptions: Joi.object({
        scale: Joi.number(),
        displayHeaderFooter: Joi.boolean(),
        headerTemplate: Joi.string().valid("date", "title", "url", "pageNumber", "totalPages"),
        footerTemplate: Joi.string().valid("date", "title", "url", "pageNumber", "totalPages"),
        printBackground: Joi.boolean(),
        landscape: Joi.boolean(),
        pageRanges: Joi.string(),
        format: Joi.string().valid("Letter", "Legal", "Tabloid", "Ledger", "A0", "A1", "A2", "A3", "A4", "A5", "A6"),
        width: Joi.number(),
        height: Joi.number(),
        margin: Joi.object({
          top: Joi.number(),
          right: Joi.number(),
          bottom: Joi.number(),
          left: Joi.number(),
        }),
        preferCSSPageSize: Joi.boolean(),
      }),
    }).required(),
  },
  { abortEarly: false },
);

export const createPdfAction = ({ commandBus, config }: CreatePdfActionProps) => (
  /**
   * @swagger
   *
   * /api/pdf/create-pdf:
   *   post:
   *     tags:
   *       - PDF
   *     summary: Create pdf from url
   *     description: Create pdf from url
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               from:
   *                 type: string
   *                 required: true
   *                 example: https://www.example.com
   *               type:
   *                 type: string
   *                 required: true
   *                 enum: [uri,html]
   *                 example: uri
   *               pdfOptions:
   *                 type: object
   *                 example: { "format":"Letter"}
   *                 properties:
   *                   scale:
   *                     type: number
   *                     description: Scale of the webpage rendering.
   *                     required: false
   *                     default: 1
   *                   displayHeaderFooter:
   *                     type: boolean
   *                     description: Display header and footer.
   *                     required: false
   *                     default: false
   *                   headerTemplate:
   *                     type: string
   *                     description: "HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: 'date' formatted print date, 'title' document title, 'url' document location, 'pageNumber' current page number, 'totalPages' total pages in the document."
   *                     required: false
   *                     enum: [date, title, url, pageNumber, totalPages]
   *                   footerTemplate:
   *                     type: string
   *                     description: "HTML template for the print footer. Should be valid HTML markup with following classes used to inject printing values into them: 'date' formatted print date, 'title' document title, 'url' document location, 'pageNumber' current page number, 'totalPages' total pages in the document."
   *                     required: false
   *                     enum: [date, title, url, pageNumber, totalPages]
   *                   printBackground:
   *                     type: boolean
   *                     description: Print background graphics.
   *                     required: false
   *                     default: false
   *                   landscape:
   *                     type: boolean
   *                     description: Paper orientation.
   *                     required: false
   *                     default: false
   *                   pageRanges:
   *                     type: string
   *                     description: Paper ranges to print, e.g., '1-5, 8, 11-13'. Default '' which means print all pages.
   *                     required: false
   *                     default: ''
   *                   format:
   *                     type: string
   *                     description: Paper format. If set, takes priority over width or height options.
   *                     required: false
   *                     enum: [Letter, Legal, Tabloid, Ledger, A0, A1, A2, A3, A4, A5, A6]
   *                     default: Letter
   *                   width:
   *                     type: number
   *                     description: Paper width. Set 0 for auto width.
   *                     required: false
   *                   height:
   *                     type: number
   *                     description: Paper height. Set 0 for auto height.
   *                     required: false
   *                   margin:
   *                     type: object
   *                     description: Paper margins, defaults to none.
   *                     properties:
   *                       top:
   *                         type: number
   *                         description: Top margin.
   *                       right:
   *                         type: number
   *                         description: Right margin.
   *                       bottom:
   *                         type: number
   *                         description: Bottom margin.
   *                       left:
   *                         type: number
   *                         description: Left margin.
   *                   preferCSSPageSize:
   *                     type: boolean
   *                     description: Give any CSS @page size declared in the page priority over what is declared in width and height or format options. Default false which will scale the content to fit the paper size.
   *                     default: false
   *     responses:
   *       201:
   *         description: Pdf created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 url:
   *                   type: string
   *                   example: http://pdf:50050/api/download-pdf/123e4567-e89b-12d3-a456-426614174000
   *                 expiryAt:
   *                   type: string
   *                   example: 2020-05-21T11:00:00.000Z
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref:  "#/definitions/BadRequestError"
   *       500:
   *         description: Internal Server Error
   */
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { pdfOptions: defaultPdfOptions } = config;
  const { from, type, pdfOptions = defaultPdfOptions } = req.body;

  commandBus
    .execute(
      new CreatePdfCommand({
        from,
        type,
        pdfOptions,
      }),
    )
    .then((commandResult) => res.status(CREATED).json(commandResult))
    .catch(next);
};
