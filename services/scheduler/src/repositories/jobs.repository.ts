import { JobModel, JobStatus } from "../app/features/scheduling/models/job.model";
import { UpdateResult } from "typeorm";

export interface JobsRepository {
  addJob: (job: JobModel) => Promise<JobModel>;
  findById: (id: string) => Promise<JobModel | undefined>;
  updateStatus: (id: string, status: JobStatus) => Promise<UpdateResult>;
}
