import { Handler } from "../../../../../../../shared/command-bus";
import { CREATE_PDF_COMMAND_TYPE, CreatePdfCommand } from "../commands/create-pdf.command";
import { AppConfig } from "../../../../config/config";
import { ChromiumBrowser } from "../../../../utils/chromium-browser";

export type CreatePdfHandlerProperties = {
  config: AppConfig;
  chromiumBrowser: ChromiumBrowser;
};

export default class CreatePdfHandler implements Handler<CreatePdfCommand> {
  public commandType: string = CREATE_PDF_COMMAND_TYPE;

  constructor(private properties: CreatePdfHandlerProperties) {}

  async execute(command: CreatePdfCommand) {
    const { chromiumBrowser } = this.properties;
    const { from, type, pdfOptions } = command.payload;

    return chromiumBrowser.createPdf({
      from,
      type,
      pdfOptions,
    });
  }
}
