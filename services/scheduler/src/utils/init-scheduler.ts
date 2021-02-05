import { JobDescription, SchedulerRule } from "../scheduler";
import { Scheduler } from "../scheduler/producer/scheduler.types";
import { Logger } from "@tshio/logger";
import { JobsRepository } from "../repositories/jobs.repository";

type InitSchedulerProps = {
  jobsRepository: JobsRepository;
  scheduler: Scheduler;
  logger: Logger;
};

export class InitScheduler {
  constructor(private dependencies: InitSchedulerProps) {}

  public async processInitialJobSilent(job: JobDescription) {
    const { jobsRepository, scheduler, logger } = this.dependencies;
    if (job.rule === undefined || job.rule === SchedulerRule.NORMAL) {
      const result = await scheduler
        .createJob(job)
        .then(() => `Initial job added: ${job}`)
        .catch((error) => `InitialJobs error: "${error.message}" while adding initial job: ${job}`);
      logger.info(result);
      return;
    }

    if (job.rule === SchedulerRule.OVERWRITE) {
      await scheduler.cancelJob(job.name).catch();
      await jobsRepository.removeJob({ name: job.name }).catch();

      const result = await scheduler
        .createJob(job)
        .then(() => `Initial job has overwritten: ${job}`)
        .catch((error) => `InitialJobs error: "${error.message}" while overwriting initial job: ${job}`);
      logger.info(result);
      return;
    }

    if (job.rule === SchedulerRule.DELETE) {
      await scheduler.cancelJob(job.name).catch();
      await jobsRepository.removeJob({ name: job.name }).catch();
      logger.info("Initial job deleted");
    }
  }

  public async addInitialJobs(jobs: JobDescription[]) {
    // eslint-disable-next-line
    for (const job of jobs) {
      await this.processInitialJobSilent(job); // eslint-disable-line
    }
  }
}
