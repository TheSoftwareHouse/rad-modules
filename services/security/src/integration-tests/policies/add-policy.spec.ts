import * as request from "supertest";
import { CREATED, CONFLICT, BAD_REQUEST } from "http-status-codes";
import * as assert from "assert";
import { usersFixture } from "../fixtures/users.fixture";
import { deepEqualOmit, isUuid, isNotEmptyString } from "../../../../../shared/test-utils";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { GlobalData } from "../bootstrap";
import { Event } from "../../shared/event-dispatcher";
import * as awilix from "awilix";
import { deepStrictEqual } from "assert";

const [userWithAdminPanelAttr] = usersFixture;

describe("Policy test", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return created status after new policy creation", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const resource = "new_resource";
    const attribute = "new_attribute";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const { body, status } = await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource, attribute })
      .expect("Content-Type", /json/);

    assert(status === CREATED || status === CONFLICT);
    if (status === CREATED) {
      assert(isNotEmptyString(body?.id));
      assert(isUuid(body?.id));
    }
  });

  it("Should return conflict status if user try to add policy that already exists", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const resource = "test_resource";
    const attribute = "test_attribute";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource, attribute })
      .expect(CREATED)
      .expect("Content-Type", /json/);

    return request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource, attribute })
      .expect("Content-Type", /json/)
      .expect(CONFLICT)
      .expect(deepEqualOmit(BadRequestResponses.policyAlreadyExists));
  });

  it("Should return bad request status if user try to add policy with wrong request payload", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const resource = "test_resource";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource: "", attribute: "" })
      .expect(BAD_REQUEST)
      .expect("Content-Type", /json/);

    return request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource })
      .expect(BAD_REQUEST)
      .expect("Content-Type", /json/);
  });

  it("Should trigger PolicyAdded", async () => {
    let triggeredEvent: Event | undefined;
    GLOBAL.bootstrap.container.register({
      httpEventHandler: awilix.asFunction(() => (event: Event) => {
        triggeredEvent = event;
      }),
    });
    const { authClient, app } = GLOBAL.bootstrap;
    const resourceName = "resourceName";
    const attributeName = "attributeName";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const { body, status } = await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource: resourceName, attribute: attributeName })
      .expect("Content-Type", /json/);
    assert(status === CREATED || status === CONFLICT);

    // noinspection JSUnusedAssignment
    deepStrictEqual(triggeredEvent, {
      name: "PolicyAdded",
      payload: {
        policyId: body.id,
        attributeName,
        resourceName,
      },
    });
  });
});
