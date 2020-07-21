import * as assert from "assert";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { createJobs } from "../helper";
import { deepStrictEqual } from "assert";

describe("Scheduler tests: get jobs", () => {
  const GLOBAL = global as GlobalData;

  it("Should return empty set when there is no jobs", async () => {
    return request(GLOBAL.container.resolve("app")).get("/api/scheduling/get-jobs").expect(200).expect({
      jobs: [],
      total: 0,
      page: 1,
      limit: 25,
    });
  });

  it("Should return all jobs when no filters provided", async () => {
    await createJobs();
    return request(GLOBAL.container.resolve("app"))
      .get("/api/scheduling/get-jobs")
      .expect(200)
      .expect((res) => {
        assert(Array.isArray(res.body.jobs));
        deepStrictEqual(res.body.jobs.length, 5);
      });
  });

  it("Should return only jobs that match the filter", async () => {
    await createJobs();
    return request(GLOBAL.container.resolve("app"))
      .get("/api/scheduling/get-jobs")
      .query({ filter: { name: { include: "super" } } })
      .expect(200)
      .expect((res) => {
        assert(Array.isArray(res.body.jobs));
        deepStrictEqual(res.body.jobs.length, 3);
      });
  });

  it("Should return ordered jobs", async () => {
    await createJobs();
    return request(GLOBAL.container.resolve("app"))
      .get("/api/scheduling/get-jobs")
      .query({ order: { by: "name", type: "desc" } })
      .expect(200)
      .expect((res) => {
        assert(Array.isArray(res.body.jobs));
        deepStrictEqual(res.body.jobs.length, 5);
        deepStrictEqual(res.body.jobs[0].id, "00000000-0000-0000-0000-000000000005");
        deepStrictEqual(res.body.jobs[4].id, "00000000-0000-0000-0000-000000000001");
      });
  });
});
