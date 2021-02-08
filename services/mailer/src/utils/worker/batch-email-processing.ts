import { EmailQueue } from "./email-queue";
import { MailerConfig, MailSender } from "../mail-sender";
import { TaskWorker } from "./task-worker";
import { Logger } from "@tshio/logger";

type BatchEmailProcessingProps = {
  emailQueue: EmailQueue;
  mailSender: MailSender;
  mailerConfig: MailerConfig;
  logger: Logger;
};

export class BatchEmailProcessing {
  constructor(private dependencies: BatchEmailProcessingProps) {
    this.worker = new TaskWorker({
      callback: async () => this.process(),
      period: dependencies.mailerConfig.batch.period,
      retryAfter: dependencies.mailerConfig.batch.period,
      lockTriggerDelay: dependencies.mailerConfig.batch.period,
    });
  }

  private worker: TaskWorker;

  public async process() {
    const { mailSender, emailQueue, mailerConfig, logger } = this.dependencies;
    const max = mailerConfig.batch.size;

    const emails = await emailQueue.get(max);

    if (emails.length) {
      return mailSender
        .send(emails)
        .catch((error) => logger.error(error instanceof Error ? error.message : "Unknown error while sending email"));
    }

    return Promise.resolve();
  }

  public async start() {
    this.worker.start();
  }
}
