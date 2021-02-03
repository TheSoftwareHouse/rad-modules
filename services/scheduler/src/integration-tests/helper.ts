import { GlobalData } from "./bootstrap";
import { JobsRepository } from "../repositories/jobs.repository";
import { JobModel } from "../app/features/scheduling/models/job.model";
import { JobType } from "../scheduler";

export const createJobs = async () => {
  const _GLOBAL = global as any;
  const GLOBAL = _GLOBAL as GlobalData;

  await GLOBAL.container.resolve<JobsRepository>("jobsRepository").addJobs(
    [
      { name: "A super test1", type: JobType.HTTP, payload: { url: "example.com" } },
      { name: "B test2", type: JobType.HTTP, payload: { url: "example.com" } },
      { name: "C super test3", type: JobType.HTTP, payload: { url: "example.com" } },
      { name: "D super test4", type: JobType.HTTP, payload: { url: "example.com" } },
      { name: "E test5", type: JobType.HTTP, payload: { url: "example.com" } },
    ].map((job) => {
      return JobModel.create(job);
    }),
  );
};
