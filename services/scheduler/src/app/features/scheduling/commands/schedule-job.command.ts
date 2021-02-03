import { Command } from "@tshio/command-bus";
import { JobDescription } from "../../../../scheduler";

export const SCHEDULE_JOB_COMMAND_TYPE = "scheduling/SCHEDULEJOB";

export type ScheduleJobCommandPayload = JobDescription;

export class ScheduleJobCommand implements Command<ScheduleJobCommandPayload> {
  public type: string = SCHEDULE_JOB_COMMAND_TYPE;

  constructor(public payload: ScheduleJobCommandPayload) {}
}
