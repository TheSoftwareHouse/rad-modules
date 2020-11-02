import { JobModel, JobStatus } from "../app/features/scheduling/models/job.model";
import { DeleteResult, UpdateResult } from "typeorm";
import { QueryObject } from "../../../security/src/repositories/helpers/query-filter";

export interface JobsRepository {
  addJob: (job: JobModel) => Promise<JobModel>;
  addJobs: (jobs: JobModel[]) => Promise<JobModel[]>;
  upsertJob: (job: JobModel) => Promise<JobModel | UpdateResult>;
  findById: (id: string) => Promise<JobModel | undefined>;
  updateStatus: (name: string, status: JobStatus) => Promise<UpdateResult>;
  updateJob: (name: string, job: Partial<JobModel>) => Promise<UpdateResult>;
  getJobs: (payload: QueryObject) => Promise<{ jobs: JobModel[]; total: number }>;
  getJob: (job: Partial<JobModel>) => Promise<JobModel | undefined>;
  getActiveJobs: () => Promise<JobModel[]>;
  removeJob: (criteria: Partial<JobModel>) => Promise<DeleteResult>;
}
