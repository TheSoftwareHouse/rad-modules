import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { Joi } from "celebrate";
import { PDFFormat, PDFOptions } from "puppeteer-core";

const PdfOptionsSchema = Joi.object({
  scale: Joi.number(),
  displayHeaderFooter: Joi.boolean(),
  headerTemplate: Joi.string().valid("date", "title", "url", "pageNumber", "totalPages"),
  footerTemplate: Joi.string().valid("date", "title", "url", "pageNumber", "totalPages"),
  printBackground: Joi.boolean(),
  landscape: Joi.boolean(),
  pageRanges: Joi.string(),
  format: Joi.string().valid("Letter", "Legal", "Tabloid", "Ledger", "A0", "A1", "A2", "A3", "A4", "A5", "A6"),
  width: Joi.string(),
  height: Joi.string(),
  margin: Joi.object({
    top: Joi.string(),
    right: Joi.string(),
    bottom: Joi.string(),
    left: Joi.string(),
  }),
  preferCSSPageSize: Joi.boolean(),
});

export const AppConfigSchema = Joi.object({
  port: Joi.number().port().required(),
  apiUrl: Joi.string().required(),
  applicationType: Joi.string().valid("http").required(),
  apiKeyHeaderName: Joi.string().required(),
  logger: Joi.object({
    logLevel: Joi.string().valid("error", "warn", "help", "info", "debug", "verbose", "silly").required(),
  }).required(),
  requestLogger: Joi.object({
    requestLoggerFormat: Joi.string().required(),
    keysToHide: Joi.array().items(Joi.string()).required(),
  }).required(),
  expiration: Joi.number()
    .min(1)
    .max(3600 * 24 * 365)
    .required(),
  autoRemoveExpiredFilesEnabled: Joi.boolean().required(),
  pdfOptions: PdfOptionsSchema.required(),
});

export enum MorganFormatTypes {
  Combined = "combined",
  Common = "common",
  Dev = "dev",
  Short = "short",
  Tiny = "tiny",
  Default = ":remote-addr :method :url :status :response-time ms - req-body :body - api-key :apiKey - authorization :authorization",
}

export type AppConfig = {
  port: number;
  apiUrl: string;
  applicationType: TransportProtocol;
  apiKeyHeaderName: string;
  logger: {
    logLevel: string;
  };
  requestLogger: {
    requestLoggerFormat: MorganFormatTypes | string;
    keysToHide: string[];
  };
  expiration: number;
  autoRemoveExpiredFilesEnabled: boolean;
  pdfOptions: PDFOptions;
};

export const appConfig: AppConfig = {
  port: 50050,
  apiUrl: process.env.API_URL || "http://pdf:50050",
  applicationType: TransportProtocol.HTTP,
  apiKeyHeaderName: "x-api-key",
  logger: {
    logLevel: process.env.LOG_LEVEL || "debug",
  },
  requestLogger: {
    requestLoggerFormat: process.env.REQUEST_LOGGER_FORMAT || MorganFormatTypes.Default,
    keysToHide: process.env.REQUEST_BODY_KEYS_TO_HIDE
      ? (process.env.REQUEST_BODY_KEYS_TO_HIDE || "").split(",")
      : ["password", "token", "accessToken", "accessKey", "authorization"],
  },
  expiration: process.env.PDF_DOWNLOAD_LINK_EXPIRATION ? +process.env.PDF_DOWNLOAD_LINK_EXPIRATION : 3600, // default one hour
  autoRemoveExpiredFilesEnabled: process.env.AUTOREMOVE_EXPIRED_FILES
    ? process.env.AUTOREMOVE_EXPIRED_FILES === "true"
    : true,
  pdfOptions: {
    scale: process.env.PDF_OPTIONS_SCALE ? +process.env.PDF_OPTIONS_SCALE : undefined,
    displayHeaderFooter: process.env.PDF_OPTIONS_DISPLAY_HEADER_FOOTER
      ? process.env.PDF_OPTIONS_DISPLAY_HEADER_FOOTER === "true"
      : undefined,
    headerTemplate: process.env.PDF_OPTIONS_HEADER_TEMPLATE,
    footerTemplate: process.env.PDF_OPTIONS_FOOTER_TEMPLATE,
    printBackground: process.env.PDF_OPTIONS_PRINT_BACKGROUND
      ? process.env.PDF_OPTIONS_PRINT_BACKGROUND === "true"
      : undefined,
    landscape: process.env.PDF_OPTIONS_LANDSCAPE ? process.env.PDF_OPTIONS_LANDSCAPE === "true" : undefined,
    pageRanges: process.env.PDF_OPTIONS_PAGE_RANGES,
    format: process.env.PDF_OPTIONS_FORMAT ? (process.env.PDF_OPTIONS_FORMAT as PDFFormat) : undefined,
    width: process.env.PDF_OPTIONS_WIDTH,
    height: process.env.PDF_OPTIONS_HEIGHT,
    margin: {
      top: process.env.PDF_OPTIONS_MARGIN_TOP,
      right: process.env.PDF_OPTIONS_MARGIN_RIGHT,
      bottom: process.env.PDF_OPTIONS_MARGIN_BOTTOM,
      left: process.env.PDF_OPTIONS_MARGIN_LEFT,
    },
    preferCSSPageSize: process.env.PDF_OPTIONS_PREFFER_CSS_PAGE_SIZE === "true",
  },
};
