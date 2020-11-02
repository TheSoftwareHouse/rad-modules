import { JobModel, JobStatus } from "../app/features/scheduling/models/job.model";
import { JobsRepository } from "./jobs.repository";
import { EntityRepository, In, Repository } from "typeorm";
import { createTypeORMFilter, QueryObject } from "./helpers/query-filter";
import { ConflictError } from "../errors/conflict.error";

@EntityRepository(JobModel)
export class JobsTypeormRepository extends Repository<JobModel> implements JobsRepository {
  readonly PG_UNIQUE_CONSTRAINT_VIOLATION = "23505";

  public async addJob(job: JobModel) {
    return this.save(job).catch((error) => {
      if (error?.code === this.PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictError(`Job with name ${job.name} already exists`);
      }
      throw error;
    });
  }

  public async upsertJob(job: JobModel) {
    return this.save(job).catch((error) => {
      if (error?.code === this.PG_UNIQUE_CONSTRAINT_VIOLATION) {
        return this.update({ name: job.name }, job);
      }
      throw error;
    });
  }

  public async addJobs(jobs: JobModel[]) {
    return this.save(jobs);
  }

  public async findById(id: string) {
    return this.findOne({ where: { id } });
  }

  public async updateStatus(name: string, status: JobStatus) {
    return this.update({ name }, { status });
  }

  public async updateJob(name: string, job: Partial<JobModel>) {
    return this.update({ name }, job);
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

  public async getJob(job: Partial<JobModel>) {
    return this.findOne({ where: job });
  }

  public async getActiveJobs(): Promise<JobModel[]> {
    return this.find({ where: { status: In([JobStatus.Active, JobStatus.New]) } });
  }

  public async removeJob(criteria: Partial<JobModel>) {
    return this.delete(criteria);
  }
}
