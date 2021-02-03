import { CommandHandler } from "@tshio/command-bus";
import { SCHEDULE_JOB_COMMAND_TYPE, ScheduleJobCommand } from "../commands/schedule-job.command";
import { Scheduler } from "../../../../scheduler/producer/scheduler.types";

export interface ScheduleJobHandlerProps {
  scheduler: Scheduler;
}

export default class ScheduleJobHandler implements CommandHandler<ScheduleJobCommand> {
  public commandType: string = SCHEDULE_JOB_COMMAND_TYPE;

  constructor(private dependencies: ScheduleJobHandlerProps) {}

  async execute(command: ScheduleJobCommand) {
    const { scheduler } = this.dependencies;

    return scheduler.createJob(command.payload);
  }
}
