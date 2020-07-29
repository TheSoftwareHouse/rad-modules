import { Scheduler } from "./scheduler.types";
import { v4 } from "uuid";
import * as Bull from "bull";
import { SchedulerConfig } from "../../config/config";
import { jobOptions } from "../../app/features/scheduling/models/job.model";

type BullSchedulerProps = {
  schedulerConfig: SchedulerConfig;
  redisUrl: string;
};

export class BullScheduler implements Scheduler {
  private queue: Bull.Queue<any>;

  constructor(private dependencies: BullSchedulerProps) {
    const { queueName } = this.dependencies.schedulerConfig;
    const { redisUrl } = this.dependencies;

    this.queue = new Bull(queueName, redisUrl);
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

  public async scheduleJob(name: string, action: string, service: string, options: jobOptions = {}, payload?: any) {
    const { attempts: defaultAttempts, timeBetweenAttemptsInMs } = this.dependencies.schedulerConfig;
    const customJobId = v4();
    const { attempts, backoff, cron, ...restOptions } = options;

    await this.queue.add(
      {
        name,
        action,
        service,
        payload,
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

  public async cancelJob(jobId: string, cron: string) {
    return this.queue.removeRepeatable({ jobId, cron });
  }
}
