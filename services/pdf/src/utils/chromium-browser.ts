import { Browser, launch, PDFOptions, Page, Response } from "puppeteer-core";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "../errors/http.error";
import { Logger } from "winston";
import { AppConfig } from "../config/config";
import { v4 } from "uuid";

export type BrowserConfiguration = {
  executablePath: string;
  args: string[];
};

type ChromiumBrowserDependencies = {
  browserConfig: BrowserConfiguration;
  logger: Logger;
  config: AppConfig;
};

export type CreatePdfOptions = {
  from: string;
  type: string;
  pdfOptions: PDFOptions;
};

export class ChromiumBrowser {
  private browser: Browser | void;

  constructor(private dependencies: ChromiumBrowserDependencies) {}

  private async goToUrl(page: Page, from: string): Promise<Response | null> {
    const { logger } = this.dependencies;
    return page.goto(from, { waitUntil: "networkidle2" }).catch(async (error) => {
      logger.error(error.message);
      try {
        logger.info("trying to close chromium page");
        await page.close();
      } catch (closePageError) {
        logger.error(closePageError.message);
      }
      throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    });
  }

  private async setPageContent(page: Page, html: string): Promise<void> {
    const { logger } = this.dependencies;
    return page.setContent(html).catch(async (error) => {
      logger.error(error.message);
      try {
        logger.info("trying to close chromium page");
        await page.close();
      } catch (closePageError) {
        logger.error(closePageError.message);
      }
      throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    });
  }

  async createPdf(options: CreatePdfOptions) {
    const { browserConfig, logger } = this.dependencies;
    const { expiration, apiUrl } = this.dependencies.config;
    const { from, type, pdfOptions } = options;
    const fileId = v4();
    const expiryAt = Date.now() + expiration * 1000;

    // check browser
    if (this.browser === undefined) {
      this.browser = await launch(browserConfig).catch((error) => {
        logger.error(error.message);
        throw new HttpError("Can not launch chromium ", StatusCodes.INTERNAL_SERVER_ERROR);
      });
    }

    // open new page in chromium browser
    const page = await this.browser.newPage().catch(async (error) => {
      logger.error(error.message);
      if (this.browser) {
        try {
          logger.info("trying to close chromium browser");
          await this.browser.close();
        } catch (closeBrowserError) {
          logger.error(closeBrowserError.message);
        }
      }
      throw new HttpError("Can not open new page in chromium browser", StatusCodes.INTERNAL_SERVER_ERROR);
    });

    // go to url or set html content
    if (type === "uri") {
      await this.goToUrl(page, from);
    } else {
      await this.setPageContent(page, from);
    }

    const contentSize = await page.evaluate(() => ({
      width: document.documentElement.offsetWidth,
      height: document.documentElement.offsetHeight,
    }));

    const pageSize = {
      width: pdfOptions.width === 0 ? contentSize.width : pdfOptions.width,
      height: pdfOptions.height === 0 ? contentSize.height : pdfOptions.height,
    };

    await page.pdf({ ...pdfOptions, ...pageSize, path: `/tmp/pdf/${expiryAt}.${fileId}` }).catch(async (error) => {
      logger.error(error.message);
      try {
        logger.info("trying to close chromium page");
        await page.close();
      } catch (createPdfError) {
        logger.error(createPdfError.message);
      }
      throw new HttpError("Can not create pdf - chromium error", StatusCodes.INTERNAL_SERVER_ERROR);
    });

    // close chromium page
    await page.close().catch((error) => {
      logger.error(error.message);
    });

    return {
      url: `${apiUrl}/api/download-pdf/${fileId}`,
      expiryAt: new Date(expiryAt).toISOString(),
    };
  }
}
