import * as assert from "assert";
import { Mailer } from "../utils/mailer/mailer";
import fetch from "node-fetch";
import { createLogger } from "winston";
import { MailerType } from "../config/config";

const standaloneMailerProperties = {
  mailerConfig: {
    type: MailerType.Standalone,
    mailerUrl: "http://localhost/",
    newPasswordSpaUrl: "http://localhost:3000/new-password",
    standalone: {
      pool: false,
      host: "mailhog",
      port: 1025,
      secure: false,
      auth: {
        user: "user",
        pass: "password",
      },
    },
    template: {
      createUser: "/app/services/security/src/utils/mailer/templates/create-user/default/",
      resetPassword: "/app/services/security/src/utils/mailer/templates/reset-password/default/",
      resetPasswordToken: "/app/services/security/src/utils/mailer/templates/reset-password-token/default/",
    },
    sender: {
      name: "security-integration",
      email: "security-integration@testmachine",
    },
  },
  logger: createLogger(),
};

const standaloneMailer = new Mailer(standaloneMailerProperties);

const testCreateUser = {
  email: "test-create-user@testmachine",
  name: "Test create user",
  user: "test1@testmachine",
};

const testResetPassword = {
  email: "test-reset-password@testmachine",
  name: "Test reset password",
  password: "some new password",
};

describe("Standalone mailer tests", () => {
  it("Should send email for create new user", () => {
    return standaloneMailer.sendCreateUser(testCreateUser.email, testCreateUser.name, testCreateUser.user);
  });

  it("Should not send email for create new user", () => {
    assert.rejects(standaloneMailer.sendCreateUser("bad mail format", testCreateUser.name, testCreateUser.user));
  });

  it("Should send email for reset password", () => {
    return standaloneMailer.sendResetPassword(
      testResetPassword.email,
      testResetPassword.name,
      testResetPassword.password,
    );
  });

  it("Should not send email for reset password", () => {
    assert.rejects(
      standaloneMailer.sendResetPassword("bad mail format", testResetPassword.name, testResetPassword.password),
    );
  });

  it("Check emails test", async () => {
    const response = await fetch("http://mailhog:8025/api/v2/messages?start=0&limit=2", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    assert.strictEqual(data?.count, 2);

    const createUser = data?.items[1];
    const resetPassword = data?.items[0];

    // check create user mail;

    assert.deepStrictEqual(createUser?.From, {
      Relays: null,
      Mailbox: "security-integration",
      Domain: "testmachine",
      Params: "",
    });
    assert.deepStrictEqual(createUser?.To, [
      { Relays: null, Mailbox: "test-create-user", Domain: "testmachine", Params: "" },
    ]);

    assert.deepStrictEqual(createUser?.Content?.Headers?.Subject, ["Welcome Test create user"]);
    assert.strictEqual(
      createUser?.Content?.Body,
      "<h1>Thank you for creating an account</h1><p>Hi Test create user</p><p>Your=\r\n login: test1@testmachine</p>",
    );

    // check reset password mail

    assert.deepStrictEqual(resetPassword?.From, {
      Relays: null,
      Mailbox: "security-integration",
      Domain: "testmachine",
      Params: "",
    });
    assert.deepStrictEqual(resetPassword?.To, [
      { Relays: null, Mailbox: "test-reset-password", Domain: "testmachine", Params: "" },
    ]);

    assert.deepStrictEqual(resetPassword?.Content?.Headers?.Subject, ["Reset password"]);
    assert.strictEqual(
      resetPassword?.Content?.Body,
      "<h1>Your password has been changed successfully!</h1><p>Hi Test reset =\r\npassword, your new password is: some new =\r\npassword</p>",
    );
  });
});
