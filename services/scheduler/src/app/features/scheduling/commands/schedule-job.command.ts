import { Command } from "../../../../../../../shared/command-bus";
import { jobOptions, JobStatus } from "../models/job.model";

export const SCHEDULE_JOB_COMMAND_TYPE = "scheduling/SCHEDULEJOB";

export interface ScheduleJobCommandPayload {
  name: string;
  service: string;
  action: string;
  payload?: {
    headers: {
      [key: string]: string;
    };
    queryParameters: any;
    body: any;
  };
  jobOptions?: jobOptions;
  status: JobStatus;
}

export class ScheduleJobCommand implements Command<ScheduleJobCommandPayload> {
  public type: string = SCHEDULE_JOB_COMMAND_TYPE;

  constructor(public payload: ScheduleJobCommandPayload) {}
}
