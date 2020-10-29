import { JobDescription } from "../scheduler";
import { Scheduler } from "../scheduler/producer/scheduler.types";
import { Logger } from "winston";

type InitSchedulerProps = {
  scheduler: Scheduler;
  logger: Logger;
};

export class InitScheduler {
  constructor(private dependencies: InitSchedulerProps) {}

  public async addJobSilent(job: JobDescription) {
    const { scheduler, logger } = this.dependencies;
    const result = await scheduler
      .createJob(job)
      .then(() => `Initial job added: ${job}`)
      .catch((error) => `InitialJobs error: "${error.message}" while adding initial job: ${job}`);
    logger.info(result);
  }

  public async addInitialJobs(jobs: JobDescription[]) {
    // using reduce() to sequentially resolve promises
    await jobs.reduce((acuPromise, nextJob) => acuPromise.then(() => this.addJobSilent(nextJob)), Promise.resolve());
  }
}
