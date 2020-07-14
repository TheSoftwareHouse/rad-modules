import { Handler } from "../../../../../../../shared/command-bus";
import { CANCEL_JOB_COMMAND_TYPE, CancelJobCommand } from "../commands/cancel-job.command";
import { Scheduler } from "../../../../scheduler/producer/scheduler.types";
import { JobsRepository } from "../../../../repositories/jobs.repository";
import { NotFoundError } from "../../../../errors/not-found.error";
import { JobStatus } from "../models/job.model";
import { AppError } from "../../../../errors/app.error";

export interface CancelJobHandlerProps {
  scheduler: Scheduler;
  jobsRepository: JobsRepository;
}

export default class CancelJobHandler implements Handler<CancelJobCommand> {
  public commandType: string = CANCEL_JOB_COMMAND_TYPE;

  constructor(private dependencies: CancelJobHandlerProps) {}

  async execute(command: CancelJobCommand) {
    const { id } = command.payload;
    const { scheduler, jobsRepository } = this.dependencies;

    const job = await jobsRepository.findById(id);

    if (!job || !job?.jobOptions?.cron || job?.status === JobStatus.Deleted) {
      throw new NotFoundError("Job not found, job not repeatable or job already deleted");
    }

    try {
      await scheduler.cancelJob(id, job.jobOptions.cron);
      await jobsRepository.updateStatus(id, JobStatus.Deleted);
    } catch (err) {
      throw new AppError(err);
    }
  }
}
