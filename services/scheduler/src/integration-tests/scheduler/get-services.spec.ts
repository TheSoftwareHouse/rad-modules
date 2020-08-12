// import { deepStrictEqual } from "assert";
// import * as request from "supertest";
// import { GlobalData } from "../bootstrap";
// import * as awilix from "awilix";
//
// describe("Scheduler tests: get services", () => {
//   const GLOBAL = global as GlobalData;
//
//   it("Should return empty set when there is no services", async () => {
//     await GLOBAL.container.dispose();
//     GLOBAL.container.register("manifest", awilix.asValue([]));
//     return request(GLOBAL.container.resolve("app")).get("/api/scheduling/get-services").expect(200).expect([]);
//   });
//
//   it("Should return all services", async () => {
//     return request(GLOBAL.container.resolve("app"))
//       .get("/api/scheduling/get-services")
//       .expect(200)
//       .expect((res) => {
//         deepStrictEqual(res.body, GLOBAL.container.resolve("manifest"));
//       });
//   });
// });
