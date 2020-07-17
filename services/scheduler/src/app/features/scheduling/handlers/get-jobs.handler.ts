import { Handler } from "../../../../../../../shared/command-bus";
import { GET_JOBS_COMMAND_TYPE, GetJobsCommand } from "../commands/get-jobs.command";
import { JobsRepository } from "../../../../repositories/jobs.repository";

export interface GetJobsHandlerProps {
  jobsRepository: JobsRepository;
}

export default class GetJobsHandler implements Handler<GetJobsCommand> {
  constructor(private dependencies: GetJobsHandlerProps) {}

  public commandType: string = GET_JOBS_COMMAND_TYPE;

  async execute(command: GetJobsCommand) {
    const { jobs, total } = await this.dependencies.jobsRepository.getJobs(command.payload);
    return { jobs, total, page: command.payload.page, limit: command.payload.limit };
  }
}
