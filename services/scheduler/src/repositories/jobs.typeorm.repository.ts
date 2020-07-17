import { JobModel, JobStatus } from "../app/features/scheduling/models/job.model";
import { JobsRepository } from "./jobs.repository";
import { EntityRepository, Repository } from "typeorm";
import { createTypeORMFilter, QueryObject } from "../../../security/src/repositories/helpers/query-filter";

@EntityRepository(JobModel)
export class JobsTypeormRepository extends Repository<JobModel> implements JobsRepository {
  public async addJob(job: JobModel) {
    return this.save(job);
  }

  public async addJobs(jobs: JobModel[]) {
    return this.save(jobs);
  }

  public async findById(id: string) {
    return this.findOne({ where: { id } });
  }

  public async updateStatus(id: string, status: JobStatus) {
    return this.update(id, { status });
  }

  public async getJobs(queryObject: QueryObject) {
    const whereObject = createTypeORMFilter(queryObject, "job.");
    const [jobs, total] = await this.createQueryBuilder("job")
      .select("job")
      .where(whereObject.where, whereObject.operands)
      .skip((queryObject.page - 1) * queryObject.limit)
      .take(queryObject.limit)
      .orderBy(`job.${queryObject.order.by}`, queryObject.order.type.toUpperCase())
      .cache(true)
      .getManyAndCount();
    return { jobs, total };
  }
}
