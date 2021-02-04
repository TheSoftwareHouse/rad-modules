import { deepStrictEqual, strictEqual } from "assert";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { JobsRepository } from "../../repositories/jobs.repository";
import { CREATED, NO_CONTENT } from "http-status-codes";
import { JobStatus } from "../../app/features/scheduling/models/job.model";
import { v4 } from "uuid";

describe("Scheduler tests: cancel job", () => {
  const _GLOBAL = global as any;
  const GLOBAL = _GLOBAL as GlobalData;

  const name = v4();

  it("Should add and cancel job", async () => {
    const jobOptions = {
      cron: "* * * * *",
    };
    const jobToCancel = {
      name,
      type: "http",
      payload: {
        url: "example.com",
      },
      jobOptions,
    };
    const jobsRepository = GLOBAL.container.resolve<JobsRepository>("jobsRepository");
    await request(GLOBAL.container.resolve("app"))
      .post("/api/scheduling/schedule-job")
      .send(jobToCancel)
      .expect(CREATED)
      .then(async (res) => {
        const { id } = res.body;
        const job = await jobsRepository.findById(id);
        deepStrictEqual(job!.payload, jobToCancel.payload);
        strictEqual(job!.status, JobStatus.New);
        deepStrictEqual(job!.jobOptions, { cron: "* * * * *" });
      });

    const job = await jobsRepository.getJob({ name });

    strictEqual(job?.name, name);

    await request(GLOBAL.container.resolve("app"))
      .delete(`/api/scheduling/cancel-job?jobId=${job?.id}`)
      .expect(NO_CONTENT);
  });
});
