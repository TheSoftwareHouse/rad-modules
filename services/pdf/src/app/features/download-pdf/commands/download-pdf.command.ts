import { Command } from "@tshio/command-bus";

export const DOWNLOAD_PDF_COMMAND_TYPE = "download-pdf/DOWNLOADPDF";

export interface DownloadPdfCommandPayload {
  fileId: string;
}

export class DownloadPdfCommand implements Command<DownloadPdfCommandPayload> {
  public type: string = DOWNLOAD_PDF_COMMAND_TYPE;

  constructor(public payload: DownloadPdfCommandPayload) {}
}
