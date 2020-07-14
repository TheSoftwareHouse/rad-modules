import { Handler } from "../../../../../../../shared/command-bus";
import { SCHEDULE_JOB_COMMAND_TYPE, ScheduleJobCommand } from "../commands/schedule-job.command";
import { Scheduler } from "../../../../scheduler/producer/scheduler.types";
import { JobsRepository } from "../../../../repositories/jobs.repository";
import { JobModel } from "../models/job.model";

export interface ScheduleJobHandlerProps {
  scheduler: Scheduler;
  jobsRepository: JobsRepository;
}

export default class ScheduleJobHandler implements Handler<ScheduleJobCommand> {
  public commandType: string = SCHEDULE_JOB_COMMAND_TYPE;

  constructor(private dependencies: ScheduleJobHandlerProps) {}

  async execute(command: ScheduleJobCommand) {
    const { scheduler, jobsRepository } = this.dependencies;
    const { name, action, service, payload, jobOptions } = command.payload;

    const { id } = await scheduler.scheduleJob(action, service, jobOptions, payload);
    await jobsRepository.addJob(JobModel.create({ id, name, action, service, jobOptions, payload }));

    return { id };
  }
}
