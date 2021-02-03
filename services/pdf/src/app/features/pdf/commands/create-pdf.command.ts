import { PDFOptions } from "puppeteer-core";
import { Command } from "@tshio/command-bus";

export const CREATE_PDF_COMMAND_TYPE = "pdf/CREATEPDF";

export interface CreatePdfCommandPayload {
  from: string;
  type: string;
  pdfOptions: PDFOptions;
}

export class CreatePdfCommand implements Command<CreatePdfCommandPayload> {
  public type: string = CREATE_PDF_COMMAND_TYPE;

  constructor(public payload: CreatePdfCommandPayload) {}
}
