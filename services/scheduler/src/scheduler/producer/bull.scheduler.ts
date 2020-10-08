import { Scheduler, SchedulerJob } from "./scheduler.types";
import { v4 } from "uuid";
import * as Bull from "bull";
import { SchedulerConfig } from "../../config/config";
import { Job } from "bull";
import { BullQueueDb } from "../bull-db";

type BullSchedulerProps = {
  schedulerConfig: SchedulerConfig;
  dbBull: BullQueueDb;
};

export class BullScheduler implements Scheduler {
  private queue: Bull.Queue<any>;

  constructor(private dependencies: BullSchedulerProps) {
    const { dbBull } = this.dependencies;

    this.queue = dbBull.getQueue();
  }

  public async scheduleJob(job: SchedulerJob) {
    const { attempts: defaultAttempts, timeBetweenAttemptsInMs } = this.dependencies.schedulerConfig;
    const { jobOptions = {} } = job;
    const jobId = v4();

    await this.queue.add(job, {
      jobId,
      ...jobOptions,
      repeat: jobOptions?.cron
        ? {
            cron: jobOptions.cron,
            tz: jobOptions.cronTimeZone,
            startDate: jobOptions?.cronStartDate ? new Date(jobOptions.cronStartDate) : undefined,
            endDate: jobOptions?.cronEndDate ? new Date(jobOptions.cronEndDate) : undefined,
          }
        : undefined,
      attempts: jobOptions?.attempts || defaultAttempts,
      backoff: jobOptions?.backoff || timeBetweenAttemptsInMs,
    });
    return { id: jobId };
  }

  public async cancelJob(jobName: string) {
    const jobs = await this.queue.getJobs(["active", "waiting", "delayed"]);
    const jobToDelete = jobs.find((job: Job) => job?.data?.name === jobName);
    if (jobToDelete) {
      await jobToDelete.remove();
    }
  }
}
