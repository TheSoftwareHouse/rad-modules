import { CREATED, OK, BAD_REQUEST, NOT_FOUND, NO_CONTENT } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { v4 } from "uuid";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses, UsersResponses } from "../fixtures/response.fixture";
import { deepEqualOmit, isNotEmptyString, isUuid } from "../test-utils";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr] = usersFixture;

describe("remove-attribute.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should add and remove attributes for a user and verify if attributes array is empty", async () => {
    const newUsername = v4();
    const attributes = ["attr1", "attr2"];
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(CREATED);

    const { newUserId: userId } = addUserResponse.body;

    await request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes })
      .expect(CREATED);

    await request(app)
      .delete(`/api/users/remove-attribute?userId=${userId}&attributes=${attributes.join(",")}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(NO_CONTENT);

    const { accessToken: newUserAccessToken } = await authClient.login(newUsername, "randomPassword");

    return request(app)
      .get(`/api/users/has-attribute?attributes=${attributes.join(",")}`)
      .set("Authorization", `Bearer ${newUserAccessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK, UsersResponses.hasNotAnyAttribute);
  });

  it("Should not remove an attribute when bad request", async () => {
    const newUsername = v4();
    const attributes = ["attr1", "attr2"];
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" });

    const { newUserId } = addUserResponse.body;
    assert(isNotEmptyString(newUserId));
    assert(isUuid(newUserId));

    return request(app)
      .delete(`/api/users/remove-attribute?userId=${newUserId}&attributes=${attributes.join(",")},,,`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit(BadRequestResponses.attributesNotMatchPatternErrorFactory(`${attributes.join(",")},,,`)));
  });

  it("Should not remove an attribute when not found", async () => {
    const newUsername = v4();
    const attributes = ["attr1", "attr2"];
    const badAttributes = ["attr1", "attr2", "attr3", "attr39"];
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(CREATED);

    const { newUserId: userId } = addUserResponse.body;

    await request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes })
      .expect(CREATED);

    const attributesThatUserNotHaveAdded = badAttributes.filter((attr) => {
      return !attributes.includes(attr);
    });

    return request(app)
      .delete(`/api/users/remove-attribute?userId=${userId}&attributes=${badAttributes.join(",")}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(NOT_FOUND)
      .expect(deepEqualOmit(BadRequestResponses.userHasNotAttributesErrorFactory(attributesThatUserNotHaveAdded)));
  });
});
