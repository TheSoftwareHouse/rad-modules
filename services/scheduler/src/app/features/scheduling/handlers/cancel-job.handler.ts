import { Handler } from "../../../../../../../shared/command-bus";
import { CANCEL_JOB_COMMAND_TYPE, CancelJobCommand } from "../commands/cancel-job.command";
import { Scheduler } from "../../../../scheduler/producer/scheduler.types";
import { JobsRepository } from "../../../../repositories/jobs.repository";
import { NotFoundError } from "../../../../errors/not-found.error";
import { JobStatus } from "../models/job.model";

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

    if (!job || job?.status === JobStatus.Deleted) {
      throw new NotFoundError("Job not found");
    }

    return scheduler.cancelJob(job.name);
  }
}
