import { JobModel, JobStatus } from "../app/features/scheduling/models/job.model";
import { JobsRepository } from "./jobs.repository";
import { Repository, EntityRepository } from "typeorm";

@EntityRepository(JobModel)
export class JobsTypeormRepository extends Repository<JobModel> implements JobsRepository {
  public async addJob(job: JobModel) {
    return this.save(job);
  }

  public async findById(id: string) {
    return this.findOne({ where: { id } });
  }

  public async updateStatus(id: string, status: JobStatus) {
    return this.update(id, { status });
  }
}
