import { JobModel, JobStatus } from "../app/features/scheduling/models/job.model";
import { UpdateResult } from "typeorm";
import { QueryObject } from "../../../security/src/repositories/helpers/query-filter";

export interface JobsRepository {
  addJob: (job: JobModel) => Promise<JobModel>;
  addJobs: (jobs: JobModel[]) => Promise<JobModel[]>;
  findById: (id: string) => Promise<JobModel | undefined>;
  updateStatus: (id: string, status: JobStatus) => Promise<UpdateResult>;
  getJobs: (payload: QueryObject) => Promise<{ jobs: JobModel[]; total: number }>;
}
