import { Handler } from "../../../../../../../shared/command-bus";
import { SCHEDULE_JOB_COMMAND_TYPE, ScheduleJobCommand } from "../commands/schedule-job.command";
import { Scheduler } from "../../../../scheduler/producer/scheduler.types";
import { JobsRepository } from "../../../../repositories/jobs.repository";
import { JobModel, JobStatus } from "../models/job.model";

export interface ScheduleJobHandlerProps {
  scheduler: Scheduler;
  jobsRepository: JobsRepository;
}

export default class ScheduleJobHandler implements Handler<ScheduleJobCommand> {
  public commandType: string = SCHEDULE_JOB_COMMAND_TYPE;

  constructor(private dependencies: ScheduleJobHandlerProps) {}

  async execute(command: ScheduleJobCommand) {
    const { scheduler, jobsRepository } = this.dependencies;
    const { name, action, service, payload, jobOptions, status } = command.payload;

    if (status === JobStatus.Active) {
      await scheduler.scheduleJob(name, action, service, jobOptions, payload);
    }
    const { id } = await jobsRepository.addJob(JobModel.create({ name, action, service, jobOptions, payload, status }));

    return { id };
  }
}
