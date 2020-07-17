import { GlobalData } from "./bootstrap";
import { JobsRepository } from "../repositories/jobs.repository";
import { JobModel } from "../app/features/scheduling/models/job.model";

export const createJobs = async () => {
  const GLOBAL = global as GlobalData;
  await GLOBAL.container.resolve<JobsRepository>("jobsRepository").addJobs(
    [
      { name: "A super test1", action: "addUser", service: "security", id: "00000000-0000-0000-0000-000000000001" },
      { name: "B test2", action: "addUser", service: "security", id: "00000000-0000-0000-0000-000000000002" },
      { name: "C super test3", action: "addUser", service: "security", id: "00000000-0000-0000-0000-000000000003" },
      { name: "D super test4", action: "addUser", service: "security", id: "00000000-0000-0000-0000-000000000004" },
      { name: "E test5", action: "addUser", service: "security", id: "00000000-0000-0000-0000-000000000005" },
    ].map((job) => {
      return JobModel.create(job);
    }),
  );
};
