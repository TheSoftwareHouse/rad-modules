import { TransportProtocol } from "../../../../../shared/enums/transport-protocol";
import { ProxyCall } from "../proxy-call/proxy-call";
import { SchedulerConsumer } from "./consumer.types";
import { SchedulerConfig } from "../../config/config";
import * as Bull from "bull";
import { Logger } from "winston";
import { JobsRepository } from "../../repositories/jobs.repository";
import { JobStatus } from "../../app/features/scheduling/models/job.model";

type BullSchedulerConsumerProps = {
  schedulerConfig: SchedulerConfig;
  redisUrl: string;
  proxyCall: ProxyCall;
  logger: Logger;
  jobsRepository: JobsRepository;
};

export class BullSchedulerConsumer implements SchedulerConsumer {
  constructor(private dependencies: BullSchedulerConsumerProps) {}

  public startListening() {
    const { queueName } = this.dependencies.schedulerConfig;
    const { redisUrl, proxyCall, logger, jobsRepository } = this.dependencies;

    const queue = new Bull(queueName, redisUrl);

    queue.process(async (message) => {
      if (this.isOtherServiceJob(message.data)) {
        return proxyCall(message.data.action, message.data.service, message.data.payload, TransportProtocol.HTTP);
      }
      logger.error("Failed to handle a job - action or service are missing.");
      return Promise.resolve();
    });
    queue
      .on("error", (error: Error) => {
        logger.error(`An error occured: ${error.message}`);
      })
      .on("active", (job: any) => {
        logger.info(`A job '${job?.data?.name}' has started`);
      })
      .on("completed", async (job, result: string) => {
        if (job.finishedOn) {
          if (job?.opts?.repeat) {
            await jobsRepository.updateJob(job?.data?.name, {});
          } else {
            await jobsRepository.updateStatus(job?.data?.name, JobStatus.Completed);
          }
        }
        logger.info(`A job '${job?.data?.name}' successfully completed with a result: ${result}`);
      })

      .on("failed", async (job, error: Error) => {
        if (job.finishedOn) {
          if (job?.opts?.repeat) {
            await jobsRepository.updateJob(job?.data?.name, {});
          } else {
            await jobsRepository.updateStatus(job?.data?.name, JobStatus.Failed);
          }
        }
        logger.error(`A job '${job?.data?.name}' failed with reason: ${error.message}`);
      })
      .on("removed", (job) => {
        logger.info(`A job '${job?.data?.name}' successfully removed.`);
      });
  }

  private isOtherServiceJob(job: any) {
    return job && job.action && job.service;
  }
}
