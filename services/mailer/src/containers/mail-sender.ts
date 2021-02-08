import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { MailSender } from "../utils/mail-sender";
import { BatchEmailProcessing } from "../utils/worker/batch-email-processing";

export async function registerMailSender(container: AwilixContainer, appConfig: AppConfig) {
  const { mailerConfig } = appConfig;
  const mailSender = new MailSender(mailerConfig);

  container.register({
    mailerConfig: awilix.asValue(appConfig.mailerConfig),
    mailSender: awilix.asValue(mailSender),
    batchEmailProcessing: awilix.asClass(BatchEmailProcessing),
  });

  return container;
}
