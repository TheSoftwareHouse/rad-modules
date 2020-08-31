import { Command } from "../../../../../../../shared/command-bus";
import { JobOptions } from "../models/job.model";
import { HttpPayload, JobType } from "../../../../scheduler";

export const SCHEDULE_JOB_COMMAND_TYPE = "scheduling/SCHEDULEJOB";

export interface ScheduleJobCommandPayload {
  name: string;
  type: JobType;
  payload: HttpPayload;
  jobOptions: JobOptions;
  startImmediately: boolean;
}

export class ScheduleJobCommand implements Command<ScheduleJobCommandPayload> {
  public type: string = SCHEDULE_JOB_COMMAND_TYPE;

  constructor(public payload: ScheduleJobCommandPayload) {}
}
