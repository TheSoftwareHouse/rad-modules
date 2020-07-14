import * as glob from "glob";
import { NotFoundError } from "../errors/not-found.error";
import { ParsedPath, parse } from "path";
import { remove } from "fs-extra";

export class FileRemover {
  private getFiles(path: string) {
    return new Promise((resolve, reject) =>
      glob(path, (error, files) => {
        if (error) {
          return reject(new NotFoundError("Not found"));
        }
        return resolve(files);
      }),
    );
  }

  async removeExpiredFiles(path = "/tmp/pdf/*.*", dateNow = Date.now()) {
    const files: any = await this.getFiles(path).catch(() => []);

    const fileNames: ParsedPath[] = files.map((file: string) => parse(file));

    const filesToRemove = fileNames.filter((file) => !Number.isNaN(Number(file.name)) && Number(file.name) <= dateNow);

    return Promise.all(filesToRemove.map((file) => remove(`${file.dir}/${file.name}`)));
  }
}
