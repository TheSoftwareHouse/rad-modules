import { jobOptions, JobStatus } from "../../app/features/scheduling/models/job.model";

export interface Scheduler {
  scheduleJob: (
    name: string,
    action: string,
    service: string,
    dbStatus: JobStatus,
    jobOptions?: jobOptions,
    payload?: any,
  ) => Promise<{ id: string }>;
  cancelJob: (jobName: string) => Promise<void>;
}
