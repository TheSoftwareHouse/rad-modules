import { Scheduler, SchedulerJob } from "./scheduler.types";
import { v4 } from "uuid";
import * as Bull from "bull";
import { SchedulerConfig } from "../../config/config";
import { JobOptions } from "../../app/features/scheduling/models/job.model";
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

  private getCronOptions(options: JobOptions): Bull.CronRepeatOptions {
    const { cron = "", cronStartDate, cronEndDate, cronLimit, cronTimeZone } = options;
    return {
      cron,
      startDate: cronStartDate,
      endDate: cronEndDate,
      limit: cronLimit,
      tz: cronTimeZone,
    };
  }

  public async scheduleJob(job: SchedulerJob) {
    const { attempts: defaultAttempts, timeBetweenAttemptsInMs } = this.dependencies.schedulerConfig;
    const customJobId = v4();
    const { attempts, backoff, cron, ...restOptions } = job.jobOptions;
    await this.queue.add(job, {
      jobId: customJobId,
      repeat: cron ? this.getCronOptions(job.jobOptions) : undefined,
      attempts: attempts || defaultAttempts,
      backoff: backoff || timeBetweenAttemptsInMs,
      ...restOptions,
    });

    return { id: customJobId };
  }

  public async cancelJob(jobName: string) {
    const jobs = await this.queue.getJobs(["active", "waiting", "delayed"]);
    const jobToDelete = jobs.find((job: Job) => job?.data?.name === jobName);
    if (jobToDelete) {
      await jobToDelete.remove();
    }
  }
}
