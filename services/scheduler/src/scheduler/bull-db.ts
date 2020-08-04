import * as Bull from "bull";
import { Queue } from "bull";
import { Connection } from "typeorm/connection/Connection";
import { SchedulerConfig } from "../config/config";
import { JobsRepository } from "../repositories/jobs.repository";
import { JobModel } from "../app/features/scheduling/models/job.model";
import { Logger } from "winston";
import { v4 } from "uuid";

type BullQueueDbProps = {
  schedulerConfig: SchedulerConfig;
  redisUrl: string;
  dbConnection: Connection;
  jobsRepository: JobsRepository;
  logger: Logger;
};

export class BullQueueDb {
  constructor(private dependencies: BullQueueDbProps) {
    const {
      schedulerConfig: { queueName },
      redisUrl,
      logger,
    } = dependencies;
    this.queue = Bull(queueName, redisUrl);
    this.queue.client.on("connect", async () => {
      const addedJobs = await this.synchronize();
      if (addedJobs.length) {
        logger.info(`A jobs '${addedJobs.join(",")}' successfully added after db -> bull synchronizing`);
      }
    });
  }

  private readonly queue: Queue<any>;

  private async synchronize() {
    const { jobsRepository } = this.dependencies;
    const redisJobs = (await this.queue.getJobs(["completed", "waiting", "active", "delayed", "failed"])).filter(
      (job) => job?.data?.name,
    );
    const redisJobsNames = redisJobs.map((job) => job.data.name);
    const dbJobs = await jobsRepository.getActiveJobs();

    const jobsToAdd = dbJobs.filter((job: JobModel) => !redisJobsNames.includes(job.name));

    await Promise.all(
      jobsToAdd.map((job) =>
        this.queue.add(
          {
            jobId: v4(),
            name: job.name,
            action: job.action,
            service: job.service,
            payload: job.payload,
            dbStatus: job.status,
          },
          job.jobOptions,
        ),
      ),
    );

    return jobsToAdd;
  }

  public getQueue(): Queue {
    return this.queue;
  }
}
