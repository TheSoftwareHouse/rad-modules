import * as assert from "assert";
import { BAD_REQUEST, CREATED } from "http-status-codes";
import * as request from "supertest";
import { Application } from "express";
import { AppConfig } from "../config/config";
import * as glob from "glob";
import { remove } from "fs-extra";

describe("create-pdf.action test", () => {
  let app: Application;
  let container: any;
  let config: AppConfig;
  before(async () => {
    const { container: globalContainer } = global as any;
    container = globalContainer;
    app = container.resolve("app");
    config = container.resolve("config");
  });

  it("Should create pdf from uri", async () => {
    const body = {
      from: "http://www.example.com",
      type: "uri",
      pdfOptions: {},
    };
    const startTime = Math.floor(Date.now() / 1000);

    const result = await request(app).post("/api/pdf/create-pdf").send(body).expect(CREATED);

    const expiryTime = Math.floor(new Date(result.body.expiryAt).getTime() / 1000);

    // check expiry date
    assert.strictEqual(startTime + config.expiration, expiryTime);

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
    await remove(files.pop());
  }).timeout(5000);

  it("Should create pdf from html", async () => {
    const body = {
      from: "<p>Pdf test</p>",
      type: "html",
      pdfOptions: {},
    };
    const expiryTime = Math.floor(Date.now() / 1000) + config.expiration;

    const result = await request(app).post("/api/pdf/create-pdf").send(body).expect(CREATED);

    const expiryTimeFromResponse = Math.floor(new Date(result.body.expiryAt).getTime() / 1000);

    // check expiry date
    assert.strictEqual(expiryTimeFromResponse - expiryTime <= 1, true);

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
    await remove(files.pop());
  }).timeout(5000);

  it("Should not create pdf download url with wrong uri", async () => {
    const body = {
      from: "wrong uri",
      type: "uri",
      pdfOptions: {},
    };
    const result = await request(app).post("/api/pdf/create-pdf").send(body).expect(BAD_REQUEST);

    assert(result.body.error, '"from" must be a valid uri');
  }).timeout(5000);

  it("Should not create pdf download url with wrong type", async () => {
    const body = {
      from: "http://www.example.com",
      type: "wrong type",
      pdfOptions: {},
    };
    const result = await request(app).post("/api/pdf/create-pdf").send(body).expect(BAD_REQUEST);

    assert(result.body.error, '"from" must be one of [uri, html]');
  }).timeout(5000);
});
