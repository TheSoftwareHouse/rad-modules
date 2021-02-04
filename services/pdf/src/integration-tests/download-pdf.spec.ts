import * as assert from "assert";
import { BAD_REQUEST, CREATED, OK } from "http-status-codes";
import * as request from "supertest";
import { Application } from "express";
import { AppConfig } from "../config/config";
import * as glob from "glob";
import { remove, readFile } from "fs-extra";

describe("download-pdf.action test", () => {
  let app: Application;
  let container: any;
  let config: AppConfig;
  before(async () => {
    const { container: globalContainer } = global as any;
    container = globalContainer;
    app = container.resolve("app");
    config = container.resolve("config");
  });

  it("Should create pdf download url and download it", async () => {
    const body = {
      from: "http://www.example.com",
      type: "uri",
      pdfOptions: {},
    };
    const startTime = Math.floor(Date.now() / 1000);

    const result = await request(app).post("/api/pdf/create-pdf").send(body).expect(CREATED);

    const expiryTime = Math.floor(new Date(result.body.expiryAt).getTime() / 1000);

    // check expiry date
    assert.strictEqual(Math.abs(startTime + config.expiration - expiryTime) < 5, true);

    // check download url
    const pattern = `${config.apiUrl}\\/api\\/download-pdf\\/\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}`;
    assert.match(result.body.url, new RegExp(pattern));

    // check if file exist
    const filePath = `/tmp/pdf/*.${result.body.url.split("/").pop()}`;
    const globResult: any = await new Promise((resolve, reject) =>
      glob(filePath, (error, files) => {
        if (error || !files.length) {
          return reject(new Error(`File ${filePath} does not exist`));
        }
        return resolve(files);
      }),
    );
    const files = globResult || [];
    assert.strictEqual(files.length, 1);
    const pdfPathInTmpDir = files.pop();

    const fileFromTmpBuffer = await readFile(pdfPathInTmpDir);

    await request(app).get(result.body.url.replace(config.apiUrl, "")).expect(OK, fileFromTmpBuffer);

    await remove(pdfPathInTmpDir);
  }).timeout(5000);

  it("Should not download pdf file with wrong download url", async () => {
    const downloadUrl = "/api/download-pdf/wrong-file-id-format";

    const result = await request(app).get(downloadUrl).expect(BAD_REQUEST);

    assert(result.body.error, '"fileId" must be a valid GUID');
  }).timeout(5000);
});
