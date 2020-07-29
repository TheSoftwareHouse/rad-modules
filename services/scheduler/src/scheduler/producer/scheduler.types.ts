import { jobOptions } from "../../app/features/scheduling/models/job.model";

export interface Scheduler {
  scheduleJob: (
    name: string,
    action: string,
    service: string,
    jobOptions?: jobOptions,
    payload?: any,
  ) => Promise<{ id: string }>;
  cancelJob: (id: string, cron: string) => Promise<void>;
}
