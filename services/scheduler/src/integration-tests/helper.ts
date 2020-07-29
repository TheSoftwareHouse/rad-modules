import { GlobalData } from "./bootstrap";
import { JobsRepository } from "../repositories/jobs.repository";
import { JobModel } from "../app/features/scheduling/models/job.model";

export const createJobs = async () => {
  const GLOBAL = global as GlobalData;
  await GLOBAL.container.resolve<JobsRepository>("jobsRepository").addJobs(
    [
      { name: "A super test1", action: "addUser", service: "security" },
      { name: "B test2", action: "addUser", service: "security" },
      { name: "C super test3", action: "addUser", service: "security" },
      { name: "D super test4", action: "addUser", service: "security" },
      { name: "E test5", action: "addUser", service: "security" },
    ].map((job) => {
      return JobModel.create(job);
    }),
  );
};
