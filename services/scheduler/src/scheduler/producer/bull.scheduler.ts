import { Scheduler, SchedulerJob } from "./scheduler.types";
import { v4 } from "uuid";
import * as Bull from "bull";
import { SchedulerConfig } from "../../config/config";
import { Job } from "bull";
import { BullQueueDb } from "../bull-db";
import { JobOptions } from "../../app/features/scheduling/models/job.model";

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

    const createRepeatOptions = (options: JobOptions) => ({
      cron: options.cron!,
      tz: options.cronTimeZone,
      startDate: options.cronStartDate ? new Date(options.cronStartDate) : undefined,
      endDate: options.cronEndDate ? new Date(options.cronEndDate) : undefined,
    });

    await this.queue.add(job, {
      jobId,
      ...jobOptions,
      repeat: jobOptions?.cron ? createRepeatOptions(jobOptions) : undefined,
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
