import { ProxyCall } from "../proxy-call/proxy-call";
import { SchedulerConsumer } from "./consumer.types";
import { SchedulerConfig } from "../../config/config";
import { Job } from "bull";
import { Logger } from "@tshio/logger";
import { JobsRepository } from "../../repositories/jobs.repository";
import { JobModel, JobStatus } from "../../app/features/scheduling/models/job.model";
import { BullQueueDb } from "../bull-db";

type BullSchedulerConsumerProps = {
  schedulerConfig: SchedulerConfig;
  redisUrl: string;
  proxyCall: ProxyCall;
  logger: Logger;
  jobsRepository: JobsRepository;
  dbBull: BullQueueDb;
};

export class BullSchedulerConsumer implements SchedulerConsumer {
  constructor(private dependencies: BullSchedulerConsumerProps) {}

  private updateJob(jobName: string, job: Partial<JobModel>) {
    const { jobsRepository, logger } = this.dependencies;
    return jobsRepository.updateJob(jobName, job).catch((error) => {
      logger.error(`Error while updating job: ${error.message}`);
    });
  }

  public startListening() {
    const { proxyCall, logger, jobsRepository, dbBull } = this.dependencies;

    const queue = dbBull.getQueue();

    queue.process(async (job: Job) => {
      const data = await proxyCall(job.data).catch((error) => {
        logger.error(`Failed to handle a job: ${error.message}`);
      });
      return Promise.resolve(data);
    });
    queue
      .on("error", (error: Error) => {
        logger.error(`Bull queue error: ${error.message}`);
      })
      .on("active", async (job: Job) => {
        const name = job?.data?.name;

        logger.info(`A job '${name}' has started`);
        await this.updateJob(name, { status: JobStatus.Active });
      })
      .on("completed", async (job: Job, result: string) => {
        const name = job?.data?.name;

        logger.info(`A job '${name}' successfully completed with a result: ${result}`);
        if (job.finishedOn) {
          const _job = job as any;
          await this.updateJob(name, _job?.opts?.cron?.length ? {} : { status: JobStatus.Completed });
        }
      })
      .on("failed", async (job: Job, error: Error) => {
        const name = job?.data?.name;

        logger.error(`A job '${name}' failed with reason: ${error.message}`);
        if (job.finishedOn) {
          const _job = job as any;
          await this.updateJob(name, _job?.opts?.cron?.length ? {} : { status: JobStatus.Failed });
        }
      })
      .on("removed", async (job: Job) => {
        const name = job?.data?.name;

        logger.info(`A job '${name}' was removed`);
        const dbJob = await jobsRepository.getJob({ name });
        if (dbJob?.status !== JobStatus.Paused) {
          await this.updateJob(name, { status: JobStatus.Deleted });
        }
      });
  }
}
