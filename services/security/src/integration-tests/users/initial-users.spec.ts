import { OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { asValue } from "awilix";
import { InitialUsers } from "../../init/initial-users";
import { GlobalData } from "../bootstrap";

describe("Initial users tests", () => {
  const GLOBAL = {} as GlobalData;

  const usersData1 = [
    {
      username: "initialUser1FromFile",
      password: "passw0rd",
      attributes: ["attr1", "attr2", "ADMIN_PANEL"],
    },
    {
      username: "initialUser2FromFile",
      password: "passw0rd",
      attributes: ["attr1", "attr2"],
    },
    {
      username: "initialUser3FromFile",
      password: "passw0rd",
      attributes: ["attr1", "attr2"],
      isActive: false,
    },
  ];

  const usersData2 = [
    {
      username: "initialUser1FromFile",
      password: "passw0rd",
      attributes: ["attr1", "attr3"],
    },
    {
      username: "initialUser2FromFile",
      password: "passw0rd2",
      attributes: [],
    },
  ];

  const usersDataWithoutPasswords = [
    {
      username: "initialUserWithoutPasswords1FromFile",
      attributes: ["attr1", "attr3"],
    },
    {
      username: "initialUserWithoutPasswords2FromFile",
      attributes: [],
    },
  ];

  const usersDataWithoutPasswords2 = [
    {
      username: "initialUserWithoutPasswordFromFile",
      attributes: ["attr1", "attr3"],
    },
  ];

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should create initial users", () => {
    const { initialUsersProperties } = GLOBAL.bootstrap;
    const initialUsers = new InitialUsers(initialUsersProperties);
    return initialUsers.update(usersData1);
  });

  it("Should update initial users", () => {
    const { initialUsersProperties } = GLOBAL.bootstrap;
    const initialUsers = new InitialUsers(initialUsersProperties);
    return initialUsers.update(usersData2);
  });

  it("Should login with initial user 1 credentials and verify his attributes", async () => {
    const { initialUsersProperties, app } = GLOBAL.bootstrap;
    const initialUsers = new InitialUsers(initialUsersProperties);
    await initialUsers.update(usersData1);
    await initialUsers.update(usersData2);

    return request(app)
      .post("/api/users/login")
      .send({
        username: usersData1[0].username,
        password: usersData1[0].password,
      })
      .expect(OK)
      .then((loginResponse) => {
        const { accessToken } = loginResponse.body;
        return request(app)
          .post("/api/users/has-attributes")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ attributes: [...usersData1[0].attributes, ...usersData2[0].attributes] })
          .expect(OK)
          .then((hasAttributeResponse) => {
            const { hasAllAttributes } = hasAttributeResponse.body;

            assert.strictEqual(hasAllAttributes, true);
          });
      });
  });

  it("Should login with initial user 2 credentials and isActive flag should be enabled", async () => {
    const { initialUsersProperties, usersRepository, app } = GLOBAL.bootstrap;
    const initialUsers = new InitialUsers(initialUsersProperties);
    await initialUsers.update(usersData1);

    await request(app)
      .post("/api/users/login")
      .send({
        username: usersData1[0].username,
        password: usersData1[0].password,
      })
      .expect(OK);

    const user = await usersRepository.findByUsername(usersData1[0].username);

    assert.strictEqual(user?.isActive, true);
  });

  it("Should login with initial user credentials and isActive flag should be disabled", async () => {
    const { initialUsersProperties, usersRepository, container, app } = GLOBAL.bootstrap;
    container.register(
      "userActivationConfig",
      asValue({ isUserActivationNeeded: false, timeToActiveAccountInDays: 3 }),
    );
    const initialUsers = new InitialUsers(initialUsersProperties);
    await initialUsers.update(usersData1);

    await request(app)
      .post("/api/users/login")
      .send({
        username: usersData1[2].username,
        password: usersData1[2].password,
      })
      .expect(OK);

    const user = await usersRepository.findByUsername(usersData1[2].username);

    assert.strictEqual(user?.isActive, false);
  });

  it("Should generate random passwords if config setting userPasswordIsRandom eq true", async () => {
    const { initialUsersProperties } = GLOBAL.bootstrap;
    const initialUsersPropertiesWithRandomConfig = {
      ...initialUsersProperties,
      userPasswordIsRandom: true,
    };
    const initialUsers = new InitialUsers(initialUsersPropertiesWithRandomConfig);
    await initialUsers.update(usersDataWithoutPasswords);
  });

  it("Should throw error if initial users have no passwords and password is not randomly generated", async () => {
    const { initialUsersProperties } = GLOBAL.bootstrap;
    const initialUsersPropertiesWithNeededPasswordFromUsers = {
      ...initialUsersProperties,
      userPasswordIsRandom: false,
    };
    const initialUsers = new InitialUsers(initialUsersPropertiesWithNeededPasswordFromUsers);
    const userInitFunc = () => initialUsers.update(usersDataWithoutPasswords2);
    const expectedError = new Error(
      "Password cannot be empty to create a new user 'initialUserWithoutPasswordFromFile'",
    );

    assert.rejects(userInitFunc, expectedError);
  });
});
