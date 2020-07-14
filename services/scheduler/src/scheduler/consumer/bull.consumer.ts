import { TransportProtocol } from "../../../../../shared/enums/transport-protocol";
import { ProxyCall } from "../proxy-call/proxy-call";
import { SchedulerConsumer } from "./consumer.types";
import { SchedulerConfig } from "../../config/config";
import * as Bull from "bull";
import { Logger } from "winston";

type BullSchedulerConsumerProps = {
  schedulerConfig: SchedulerConfig;
  redisUrl: string;
  proxyCall: ProxyCall;
  logger: Logger;
};

export class BullSchedulerConsumer implements SchedulerConsumer {
  constructor(private dependencies: BullSchedulerConsumerProps) {}

  public startListening() {
    const { queueName } = this.dependencies.schedulerConfig;
    const { redisUrl, proxyCall, logger } = this.dependencies;

    const queue = new Bull(queueName, redisUrl);

    queue.process(async (message, done) => {
      if (this.isOtherServiceJob(message.data)) {
        logger.info(`Handling job with id ${message.id}, payload:`, message.data);

        // todo: strategy should probably be coming from config
        const result = await proxyCall(
          message.data.action,
          message.data.service,
          message.data.payload,
          TransportProtocol.HTTP,
        );

        logger.info("Job proxied call result:", result);
      } else {
        throw new Error("Failed to handle a job - action or service are missing.");
      }

      done();
    });
  }

  private isOtherServiceJob(job: any) {
    return job && job.action && job.service;
  }
}
