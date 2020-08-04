import { Scheduler } from "./scheduler.types";
import { v4 } from "uuid";
import * as Bull from "bull";
import { SchedulerConfig } from "../../config/config";
import { jobOptions, JobStatus } from "../../app/features/scheduling/models/job.model";
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

  private getCronOptions(options: jobOptions): Bull.CronRepeatOptions {
    const { cron = "", cronStartDate, cronEndDate, cronLimit, cronTimeZone } = options;
    return {
      cron,
      startDate: cronStartDate,
      endDate: cronEndDate,
      limit: cronLimit,
      tz: cronTimeZone,
    };
  }

  public async scheduleJob(
    name: string,
    action: string,
    service: string,
    dbStatus: JobStatus,
    options: jobOptions = {},
    payload?: any,
  ) {
    const { attempts: defaultAttempts, timeBetweenAttemptsInMs } = this.dependencies.schedulerConfig;
    const customJobId = v4();
    const { attempts, backoff, cron, ...restOptions } = options;

    await this.queue.add(
      {
        name,
        action,
        service,
        payload,
        dbStatus,
      },
      {
        jobId: customJobId,
        repeat: cron ? this.getCronOptions(options) : undefined,
        attempts: attempts || defaultAttempts,
        backoff: backoff || timeBetweenAttemptsInMs,
        ...restOptions,
      },
    );

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
