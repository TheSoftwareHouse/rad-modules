import { deepStrictEqual, fail } from "assert";
import { use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import { Event, EventDispatcher, EventSubscriberInterface } from "../../shared/event-dispatcher";
import { createLogger } from "@tshio/logger";
import { delay, SpiedObject } from "../../utils/tests";

use(chaiAsPromised);

type StubSubscriber = EventSubscriberInterface & {
  logEmail(event: Event): Promise<void>;
  sendEmail(event: Event): Promise<void>;
};

const stubSubscriber = {
  getSubscribedEvents() {
    return [
      { name: "userCreated", method: "sendEmail" },
      { name: "testEvent", method: "logEmail" },
    ];
  },

  async logEmail(event: Event) {
    stubSubscriber.logEmail.calledWith = event;
  },

  async sendEmail(event: Event) {
    stubSubscriber.sendEmail.calledWith = event;
  },
} as unknown as SpiedObject<StubSubscriber>;

describe("Event Dispatcher", () => {
  it("Support event subscribers", async () => {
    const dispatcher = new EventDispatcher(createLogger());
    dispatcher.addSubscriber(stubSubscriber);

    const testEvent = { name: "testEvent", payload: { foo: 1, bar: 2, baz: 3 } };
    const userCreatedEvent = { name: "userCreated", payload: { userId: 1 } };

    await dispatcher.dispatch(testEvent);
    await dispatcher.dispatch(userCreatedEvent);

    deepStrictEqual(stubSubscriber.logEmail.calledWith, testEvent);
    deepStrictEqual(stubSubscriber.sendEmail.calledWith, userCreatedEvent);
  });

  it("Support inline event subscribers", async () => {
    const dispatcher = new EventDispatcher(createLogger());

    const stubEvent = {
      name: "test",
      payload: {
        foo: 1,
        bar: 2,
        baz: 3,
      },
    };

    dispatcher.subscribe("test", async (event) => {
      deepStrictEqual(event, stubEvent);
    });

    dispatcher.subscribe("test2", async () => {
      fail("event was not fired");
    });

    await dispatcher.dispatch(stubEvent);
  });

  it("Support async operations", (done) => {
    const dispatcher = new EventDispatcher(createLogger());

    const stubEvent = {
      name: "testAsync",
      payload: {
        foo: 1,
        bar: 2,
        baz: 3,
      },
    };

    dispatcher.subscribe("testAsync", async (event) => {
      await delay(10);
      deepStrictEqual(event, stubEvent);
      done();
    });

    dispatcher.dispatch(stubEvent);
  });

  it("Error thrown by a Subscriber should not block the execution of any further Subscriber", (done) => {
    const winstonLogger = createLogger();
    const dispatcher = new EventDispatcher(winstonLogger);

    dispatcher.addSubscriber(stubSubscriber);

    dispatcher.subscribe("test", async () => {
      await delay(10);
      throw new Error("SomethingBadHappend");
    });

    dispatcher.subscribe("test", async () => {
      await delay(20);
      winstonLogger.debug("Event handled");
    });

    dispatcher
      .dispatch({
        name: "test",
        payload: { foo: 1 },
      })
      .finally(() => done());
  });
});
