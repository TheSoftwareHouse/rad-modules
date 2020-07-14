import { Handler } from "../../../../../../../shared/command-bus";
import { DOWNLOAD_PDF_COMMAND_TYPE, DownloadPdfCommand } from "../commands/download-pdf.command";
import * as glob from "glob";
import { NotFoundError } from "../../../../errors/not-found.error";

export default class DownloadPdfHandler implements Handler<DownloadPdfCommand> {
  public commandType: string = DOWNLOAD_PDF_COMMAND_TYPE;

  private getFilePath = (path: string) =>
    new Promise((resolve, reject) =>
      glob(path, (error, files) => {
        if (error || !files.length) {
          return reject(new NotFoundError("Not found"));
        }
        return resolve(files.pop());
      }),
    );

  async execute(command: DownloadPdfCommand) {
    // execute body
    const { fileId } = command.payload;
    const filePathPattern = `/tmp/pdf/*.${fileId}`;

    const pdfPath: any = await this.getFilePath(filePathPattern);

    const expiryFromFilePath = pdfPath && pdfPath.split(".").length > 1 ? +pdfPath.split(".")[1] * 1000 : Date.now();

    if (expiryFromFilePath <= Date.now()) {
      throw new NotFoundError("Not found");
    }

    return {
      pdfPath,
    };
  }
}
