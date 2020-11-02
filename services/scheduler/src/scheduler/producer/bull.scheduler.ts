import { Scheduler, SchedulerJob } from "./scheduler.types";
import { v4 } from "uuid";
import * as Bull from "bull";
import { SchedulerConfig } from "../../config/config";
import { Job } from "bull";
import { BullQueueDb } from "../bull-db";
import { JobModel, JobOptions, JobStatus } from "../../app/features/scheduling/models/job.model";
import { JobDescription } from "../index";
import { JobsRepository } from "../../repositories/jobs.repository";

type BullSchedulerProps = {
  schedulerConfig: SchedulerConfig;
  dbBull: BullQueueDb;
  jobsRepository: JobsRepository;
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

  public async createJob(jobDescription: JobDescription) {
    const { jobsRepository } = this.dependencies;
    const { name, type, payload, jobOptions, startImmediately } = jobDescription;
    const status = startImmediately ? JobStatus.New : JobStatus.Paused;

    const job = {
      name,
      type,
      payload,
      jobOptions,
      status,
    };
    const { id } = await jobsRepository.addJob(JobModel.create(job));

    if (startImmediately) {
      await this.scheduleJob(job);
    }

    return { id };
  }

  public async cancelJob(jobName: string) {
    const jobs = await this.queue.getJobs(["active", "waiting", "delayed"]);
    const jobToDelete = jobs.find((job: Job) => job?.data?.name === jobName);
    if (jobToDelete) {
      await jobToDelete.remove();
    }
  }
}
