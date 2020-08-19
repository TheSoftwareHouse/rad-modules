import { strictEqual } from "assert";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { JobsRepository } from "../../repositories/jobs.repository";
import { CONFLICT, CREATED } from "http-status-codes";
import { JobStatus } from "../../app/features/scheduling/models/job.model";

describe("Scheduler tests: schedule job", () => {
  const GLOBAL = global as GlobalData;

  it("Should schedule one time job", async () => {
    const jobRepository = GLOBAL.container.resolve<JobsRepository>("jobsRepository");
    const job = {
      name: "job",
      type: "http",
      payload: {
        url: "example.com",
      },
    };
    return request(GLOBAL.container.resolve("app"))
      .post("/api/scheduling/schedule-job")
      .send(job)
      .expect(CREATED)
      .then(async (res) => {
        const { id } = res.body;
        const dbJob = await jobRepository.findById(id);
        strictEqual(dbJob!.status, JobStatus.New);
        strictEqual(dbJob!.jobOptions, null);
      });
  });

  it("Should schedule repeatable job", async () => {
    const cron = "* * * * *";
    const jobRepository = GLOBAL.container.resolve<JobsRepository>("jobsRepository");
    const job = {
      name: "job",
      type: "http",
      payload: {
        url: "example.com",
      },
      jobOptions: { cron },
    };

    return request(GLOBAL.container.resolve("app"))
      .post("/api/scheduling/schedule-job")
      .send(job)
      .expect(CREATED)
      .then(async (res) => {
        const { id } = res.body;
        const dbJob = await jobRepository.findById(id);
        strictEqual(dbJob!.status, JobStatus.New);
        strictEqual(dbJob!.jobOptions!.cron, cron);
      });
  });

  it("Should not schedule repeatable job and throw conflict error", async () => {
    const cron = "* * * * *";
    const job = {
      name: "test-job",
      type: "http",
      payload: {
        url: "example.com",
      },
      jobOptions: { cron },
    };

    await request(GLOBAL.container.resolve("app")).post("/api/scheduling/schedule-job").send(job).expect(CREATED);

    await request(GLOBAL.container.resolve("app")).post("/api/scheduling/schedule-job").send(job).expect(CONFLICT);
  });
});
