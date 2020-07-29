import { deepStrictEqual, strictEqual } from "assert";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { JobsRepository } from "../../repositories/jobs.repository";
import { CREATED } from "http-status-codes";
import { JobStatus } from "../../app/features/scheduling/models/job.model";

describe("Scheduler tests: schedule job", () => {
  const GLOBAL = global as GlobalData;

  it("Should schedule one time job", async () => {
    const service = "service";
    const action = "getUsers";
    const jobRepository = GLOBAL.container.resolve<JobsRepository>("jobsRepository");
    return request(GLOBAL.container.resolve("app"))
      .post("/api/scheduling/schedule-job")
      .send({ name: "job", service, action })
      .expect(CREATED)
      .then(async (res) => {
        const { id } = res.body;
        const job = await jobRepository.findById(id);
        deepStrictEqual(job!.service, service);
        deepStrictEqual(job!.action, action);
        strictEqual(job!.status, JobStatus.Paused);
        strictEqual(job!.jobOptions, null);
      });
  });

  it("Should schedule repeatable job", async () => {
    const service = "service";
    const action = "getUsers";
    const cron = "* * * * *";
    const jobRepository = GLOBAL.container.resolve<JobsRepository>("jobsRepository");
    return request(GLOBAL.container.resolve("app"))
      .post("/api/scheduling/schedule-job")
      .send({ name: "job", service, action, jobOptions: { cron } })
      .expect(CREATED)
      .then(async (res) => {
        const { id } = res.body;
        const job = await jobRepository.findById(id);
        deepStrictEqual(job!.service, service);
        deepStrictEqual(job!.action, action);
        strictEqual(job!.status, JobStatus.Paused);
        strictEqual(job!.jobOptions!.cron, cron);
      });
  });
});
