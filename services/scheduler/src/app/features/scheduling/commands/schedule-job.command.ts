import { Command } from "../../../../../../../shared/command-bus";
import { jobOptions } from "../models/job.model";

export const SCHEDULE_JOB_COMMAND_TYPE = "scheduling/SCHEDULEJOB";

export interface ScheduleJobCommandPayload {
  name: string;
  service: string;
  action: string;
  payload?: any;
  jobOptions?: jobOptions;
}

export class ScheduleJobCommand implements Command<ScheduleJobCommandPayload> {
  public type: string = SCHEDULE_JOB_COMMAND_TYPE;

  constructor(public payload: ScheduleJobCommandPayload) {}
}
